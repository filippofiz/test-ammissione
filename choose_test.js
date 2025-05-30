import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";  
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Carica l'header dal file esterno
fetch('header.html')
  .then(response => response.text())
  .then(data => {
    document.getElementById('header-placeholder').innerHTML = data;
  });

document.addEventListener("DOMContentLoaded", async () => {
  const loadingState = document.getElementById('loadingState');
  const testsContainer = document.getElementById('testsContainer');
  const emptyState = document.getElementById('emptyState');

  // Mostra loading
  loadingState.style.display = 'block';

  // Aggiorna il nome nell'header dopo che è caricato
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

    // Aggiungi evento logout se presente
    document.getElementById('logoutBtn')?.addEventListener('click', async () => {
      await supabase.auth.signOut();
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }, 100);

  const studentId = sessionStorage.getItem("studentId");
  if (!studentId) {
    alert("Nessuno studente selezionato. Verrai reindirizzato al login.");
    window.location.href = "login.html";
    return;
  }
  
  // Recupera i test disponibili per lo studente
  const { data: student, error } = await supabase
    .from("students")
    .select("tests, name")
    .eq("auth_uid", studentId)
    .single();
  
  // Nascondi loading
  loadingState.style.display = 'none';

  if (error || !student) {
    console.error("Errore nel caricamento dei test:", error?.message);
    alert("Errore nel caricamento dei test. Riprova.");
    return;
  }
  
  // Popola i test
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
      
      // Animazione staggered
      btn.style.animationDelay = `${index * 0.1}s`;
      btn.style.animation = 'fadeInUp 0.6s ease-out forwards';
      
      // Gestione click
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
      alert("Per favore seleziona un test.");
      return;
    }
    const selectedTest = selectedBtn.textContent.trim();

    // Salva il test selezionato
    sessionStorage.setItem("selectedTestType", selectedTest);

    // Reindirizza alla pagina di selezione test
    window.location.href = "test_selection.html";
  });
});