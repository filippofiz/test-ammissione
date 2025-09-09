import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";  
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load the header from external file
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;
  });

document.addEventListener("DOMContentLoaded", async () => {
  const loadingState = document.getElementById('loadingState');
  const testsContainer = document.getElementById('testsContainer');
  const emptyState = document.getElementById('emptyState');

  // Show loading
  loadingState.style.display = 'block';

  // Update the name in the header after it's loaded
  setTimeout(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      const userId = sessionData.session.user.id;
      const { data: student } = await supabase
        .from("students")
        .select("name")
        .eq("auth_uid", userId)
        .single();
      
      if (student?.name) {
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
          userNameElement.textContent = student.name;
        }
      }
    }

    // Add logout event if present
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      sessionStorage.clear();
      window.location.href = "/";
    });
  }, 100);

  const studentId = sessionStorage.getItem("studentId");
  if (!studentId) {
    alert("No student selected. You will be redirected to login.");
    window.location.href = "/";
    return;
  }
  
  // Get available tests for the student
  const { data: student, error } = await supabase
    .from("students")
    .select("tests, name")
    .eq("auth_uid", studentId)
    .single();
  
  // Hide loading
  loadingState.style.display = 'none';

  if (error || !student) {
    console.error("Error loading tests:", error?.message);
    alert("Error loading tests. Please try again.");
    return;
  }
  
  // Populate the tests
  const tests = student.tests;
  const testsListDiv = document.getElementById("testsList");
  testsListDiv.innerHTML = "";
  
  if (!tests || tests.length === 0) {
    emptyState.style.display = 'block';
  } else {
    testsContainer.style.display = 'block';
    
    tests.forEach((test, index) => {
      const btn = document.createElement("button");
      btn.classList.add("test-option-btn");
      btn.textContent = test;
      
      // Staggered animation
      btn.style.animationDelay = `${index * 0.1}s`;
      btn.style.animation = 'fadeInUp 0.6s ease-out forwards';
      
      // Handle click
      btn.addEventListener("click", () => {
        document.querySelectorAll(".test-option-btn").forEach(button => {
          button.classList.remove("selected");
        });
        btn.classList.add("selected");
      });

      testsListDiv.appendChild(btn);
    });
  }
  
  const proceedBtn = document.getElementById("proceedBtn");
  proceedBtn.addEventListener("click", () => {
    const selectedBtn = document.querySelector(".test-option-btn.selected");
    if (!selectedBtn) {
      alert("Please select a test.");
      return;
    }
    const selectedTest = selectedBtn.textContent.trim();

    // Save the selected test
    sessionStorage.setItem("selectedTestType", selectedTest);

    // Redirect to test selection page
    window.location.href = "test_selection.html";
  });
});