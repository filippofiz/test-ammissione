import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";  
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
document.addEventListener("DOMContentLoaded", async () => {
    // Update greeting with student name
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData || !sessionData.session) {
      document.querySelector('.greeting').textContent = "Ciao, Utente";
    } else {
      const userId = sessionData.session.user.id;
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("name")
        .eq("auth_uid", userId)
        .single();
      if (studentError || !student) {
        document.querySelector('.greeting').textContent = "Ciao, Utente";
      } else {
        document.querySelector('.greeting').textContent = `Ciao, ${student.name}`;
      }
    }
  const studentId = sessionStorage.getItem("studentId");
  if (!studentId) {
    alert("No student selected.");
    window.location.href = "login.html";
    return;
  }
  
  // Fetch student record to get the available tests (stored in the "tests" column as an array of text)
  const { data: student, error } = await supabase
    .from("students")
    .select("tests, name")
    .eq("auth_uid", studentId)
    .single();
  
  if (error || !student) {
    console.error("Error fetching student tests:", error?.message);
    alert("Error loading tests. Please try again.");
    return;
  }
  
  // Populate test options as buttons
  const tests = student.tests;
  const testsListDiv = document.getElementById("testsList");
  testsListDiv.innerHTML = "";
  
  if (!tests || tests.length === 0) {
    testsListDiv.textContent = "No tests available.";
  } else {
    tests.forEach(test => {
      const btn = document.createElement("button");
      btn.classList.add("test-option-btn");
      btn.textContent = test;
      
      // Allow only one button to be selected at a time
      btn.addEventListener("click", () => {
        // Remove "selected" class from all buttons
        document.querySelectorAll(".test-option-btn").forEach(button => {
          button.classList.remove("selected");
        });
        // Add "selected" class only to the clicked button
        btn.classList.add("selected");
      });

      testsListDiv.appendChild(btn);
    });
  }
  
  const proceedBtn = document.getElementById("proceedBtn");
  proceedBtn.addEventListener("click", () => {
    // Get the selected test option (only one can be selected)
    const selectedBtn = document.querySelector(".test-option-btn.selected");
    if (!selectedBtn) {
      alert("Please select a test.");
      return;
    }
    const selectedTest = selectedBtn.textContent;

    // Save the selected test in sessionStorage
    sessionStorage.setItem("selectedTestType", selectedTest);

    // Redirect to the test selection page
    window.location.href = "test_selection.html";
  });
});