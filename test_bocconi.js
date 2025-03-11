const supabase = window.supabase;
let questions = [];  // Bocconi questions will be stored here
let currentPage = 1;   // Page 1 is the welcome page
let totalPages = 1;
let studentAnswers = {};  // e.g., {questionId: selectedLetter}
let correctMapping = {};  // e.g., {questionId: correctLetter} for standard choices
let testEndTime;
let timerStarted = false;
let isSubmitting = false;

// Letters for standard choices (randomized per question)
const standardLetters = ["a", "b", "c", "d", "e"];
// Fixed letters for extra choices:
const extraChoices = [
  { letter: "x", text: "insicuro" },
  { letter: "y", text: "non ho idea" }
];

document.addEventListener("DOMContentLoaded", async () => {
  await loadTest();
  
  const submitBtn = document.getElementById("submitAnswers");
  if (!submitBtn) {
    console.error("❌ ERROR: 'submitAnswers' button not found.");
    return;
  }
  submitBtn.addEventListener("click", async () => {
    console.log("📌 Submit button clicked!");
    await submitAnswersBocconi();
  });
  
  // Fullscreen exit handling
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      alert("⚠ The test has been cancelled. You are being redirected to your progress tree.");
      window.location.href = "test_selection.html";
    }
  });
  document.addEventListener("fullscreenchange", () => {
    if (isSubmitting) return;
    if (!document.fullscreenElement) {
      alert("⚠ The test has been cancelled because you exited fullscreen.");
      window.location.href = "test_selection.html";
    }
  });
});

async function loadTest() {
  const currentSection = sessionStorage.getItem("currentSection");
  const currentTipologiaEsercizi = sessionStorage.getItem("currentTipologiaEsercizi");
  const currentTestProgressivo = sessionStorage.getItem("currentTestProgressivo");
  const selectedTestType = sessionStorage.getItem("selectedTestType");
  if (!currentSection || !currentTipologiaEsercizi) {
    alert("Test data not found. Please contact your tutor.");
    window.location.href = "test_selection.html";
    return;
  }
  
  // Fetch Bocconi questions from the "questions_bocconi" table using section and test_number.
  const { data, error } = await supabase
    .from("questions_bocconi")
    .select("*")
    .eq("section", currentSection)
    .eq("tipologia_esercizi", currentTipologiaEsercizi)
    .eq("tipologia_test", selectedTestType)
    .eq("progressivo", currentTestProgressivo)
    .order("question_number");
  
  if (error) {
    console.error("Error fetching Bocconi questions:", error);
    alert("Error loading test. Check console.");
    return;
  }
  if (!data || data.length === 0) {
    alert("No questions available for this test.");
    return;
  }
  
  questions = data;
  // Total pages = welcome page + one page per 3 questions.
  totalPages = Math.ceil(questions.length / 3) + 1;
  
  buildQuestionNavBocconi();
  loadQuestionsForPage(1);
}

async function enforceFullScreen() {
  if (window.innerWidth > 1024) {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        console.log("🔲 Fullscreen Mode Activated");
      } catch (err) {
        console.error("❌ Fullscreen mode not supported:", err);
      }
    }
  }
}

function loadQuestionsForPage(page) {
    currentPage = page;
    sessionStorage.setItem("currentPage", currentPage);
    const questionContainer = document.getElementById("question-container");
    const nextPageBtn = document.getElementById("nextPage");
    const submitBtn = document.getElementById("submitAnswers");
    questionContainer.innerHTML = "";
  
    // Welcome page (Page 1)
    if (page === 1) {
      nextPageBtn.style.display = "none";
      if (submitBtn) submitBtn.style.display = "none";
      questionContainer.innerHTML = `
        <h2>Benvenuto al Test Bocconi</h2>
        <p>
          Questo test prevede che vengano visualizzate 3 domande per pagina.
          Non potrai tornare indietro: la navigazione è solo in avanti.
          Il test va svolto a schermo intero: ogni tentativo di uscita annulla il test.
        </p>
        <button id="startTestBtn">Inizia Test</button>
      `;
      document.getElementById("startTestBtn").addEventListener("click", async () => {
        timerStarted = true;
        await enforceFullScreen();
        startTimerBocconi();
        loadQuestionsForPage(2);
        nextPageBtn.style.display = "inline-block";
        if (submitBtn) submitBtn.style.display = "inline-block";
      });
      return;
    }
  
    // For test pages: show "Next" and "Submit" buttons.
    nextPageBtn.style.display = "inline-block";
    if (submitBtn) submitBtn.style.display = "inline-block";
  
    // Calculate index: page 2 shows questions[0-2], page 3 shows questions[3-5], etc.
    const startIndex = (page - 2) * 3;
    const pageQuestions = questions.slice(startIndex, startIndex + 3);
  
    pageQuestions.forEach(q => {
      const qDiv = document.createElement("div");
      qDiv.classList.add("bocconi-question");
  
      // Render question text (with LaTeX and using MathJax)  
      let content = `<p class="question-text latex">${q.question}</p>`;
  
      // Render image if provided (ensure URL is correct)
      if (q.image_url) {
        content += `<img src="${q.image_url}" alt="Question Image" class="question-image" onerror="this.style.display='none'; console.warn('Image not found:', '${q.image_url}')">`;
      }
  
      // --- Assign choices with fixed A–E order ---
      const letters = ["A", "B", "C", "D", "E"];
      const allChoices = [
        { text: q.correct_answer, isCorrect: true },
        { text: q.wrong_1, isCorrect: false },
        { text: q.wrong_2, isCorrect: false },
        { text: q.wrong_3, isCorrect: false },
        { text: q.wrong_4, isCorrect: false }
      ];
  
      // ✅ Shuffle the **correct answer position** while keeping choices in order
      allChoices.sort(() => Math.random() - 0.5);
  
      // ✅ Map shuffled answers to letters for submission (but DO NOT DISPLAY letters)
      const mappedChoices = allChoices.map((choice, idx) => ({
        letter: letters[idx], 
        text: choice.text, 
        isCorrect: choice.isCorrect
      }));
  
      // ✅ Save correct answer's assigned letter
      const correctChoice = mappedChoices.find(c => c.isCorrect);
      correctMapping[q.id] = correctChoice ? correctChoice.letter : null;
  
      // ✅ Add "insicuro" (X) and "non ho idea" (Y) at the end (always the same)
      mappedChoices.push({ letter: "X", text: "Insicuro", isCorrect: false });
      mappedChoices.push({ letter: "Y", text: "Non ho idea", isCorrect: false });
  
      // ✅ Generate choices UI **WITHOUT LETTERS**
      content += `<div class="choices">`;
      mappedChoices.forEach(choice => {
        content += `<button class="choice-btn" onclick="selectAnswerBocconi('${q.id}', '${choice.letter}', this)">
                      ${choice.text}  <!-- Only text, no letter -->
                    </button>`;
      });
      content += `</div>`;
  
      qDiv.innerHTML = content;
      qDiv.style.borderBottom = "2px solid blue"; // Blue separator
      questionContainer.appendChild(qDiv);
    });
  
    // Trigger MathJax reprocessing for LaTeX rendering.
    if (window.MathJax) {
      MathJax.typesetPromise()
        .then(() => console.log("🔢 MathJax Rendered"))
        .catch(err => console.error("❌ MathJax Rendering Error:", err));
    }
  
    buildQuestionNavBocconi();
  }

  function selectAnswerBocconi(questionId, selectedLetter, btn) {
    // Toggle the answer: unselect if the same answer is clicked again
    if (studentAnswers[questionId] === selectedLetter) {
      delete studentAnswers[questionId];
    } else {
      studentAnswers[questionId] = selectedLetter;
    }
    
    const parent = btn.parentElement;
    Array.from(parent.children).forEach(child => child.style.backgroundColor = "");
    
    // If the answer remains selected after toggling, highlight it
    if (studentAnswers[questionId]) {
      btn.style.backgroundColor = "green";
    }
    
    buildQuestionNavBocconi();
  }

function buildQuestionNavBocconi() {
  const questionNav = document.getElementById("questionNav");
  if (!questionNav) return;
  questionNav.innerHTML = "";
  // Sort questions by question_number
  const sorted = [...questions].sort((a, b) => a.question_number - b.question_number);
  sorted.forEach((q, index) => {
    const btn = document.createElement("button");
    btn.classList.add("question-cell");
    btn.textContent = q.question_number;
    if (studentAnswers[q.id]) {
      btn.classList.add("answered");
    }
    // Highlight if question belongs to current page
    const pageIndex = currentPage - 2; // Test pages start at 2
    const startIdx = pageIndex * 3;
    if (index >= startIdx && index < startIdx + 3) {
      btn.classList.add("current-question");
    }
    // Allow clicking to jump forward (but not backward)
    btn.addEventListener("click", () => {
      if (index >= startIdx) {
        const targetPage = Math.floor(index / 3) + 2;
        loadQuestionsForPage(targetPage);
      }
    });
    questionNav.appendChild(btn);
  });
}

async function submitAnswersBocconi() {
  isSubmitting = true;
  let studentId;
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData || !sessionData.session) {
    alert("Session expired. Please log in again.");
    window.location.href = "login.html";
    return;
  }
  studentId = sessionData.session.user.id;
  console.log("Student ID:", studentId);

  // For each question, if no answer selected, assign "z"
  const submissions = questions.map(q => {
    const answer = (q.id in studentAnswers) ? studentAnswers[q.id] : "z";
    // Auto score: 1 if selected letter matches the correctMapping letter; 0 otherwise.
    const auto_score = (answer === correctMapping[q.id]) ? 1 : 0;
    console.log(`Q${q.question_number}: selected ${answer}, correct ${correctMapping[q.id]}`);
    return {
      auth_uid: studentId,
      question_id: q.id,
      answer: answer,
      auto_score: auto_score
    };
  });
  console.log("Submissions:", submissions);
  const { data, error } = await supabase
    .from("studentbocconi_answers")
    .insert(submissions);
  if (error) {
    console.error("Error submitting answers:", error);
    alert("Submission failed. Please try again.");
  } else {
    alert("Answers submitted successfully!");
  }
  await supabase
    .from("student_tests")
    .update({ status: "completed" })
    .eq("auth_uid", studentId)
    .eq("section", sessionStorage.getItem("currentSection"))
    .eq("tipologia_esercizi", sessionStorage.getItem("currentTipologiaEsercizi"))
    .eq("progressivo", sessionStorage.getItem("currentTestProgressivo"))
    .eq("tipologia_test", sessionStorage.getItem("selectedTestType"));
  window.location.href = "test_selection.html";
}

async function startTimerBocconi() {
  const timerElement = document.getElementById("timer");
  timerElement.style.visibility = "visible";
  
  let studentId;
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData || !sessionData.session) {
    alert("Session expired. Please log in again.");
    window.location.href = "login.html";
    return;
  }
  studentId = sessionData.session.user.id;
  sessionStorage.setItem("studentId", studentId);
  console.log("Student ID:", studentId);
  
  const currentSection = sessionStorage.getItem("currentSection");
  const currentTipologiaEsercizi = sessionStorage.getItem("currentTipologiaEsercizi");
  const currentTestProgressivo = sessionStorage.getItem("currentTestProgressivo");
  const selectedTestType = sessionStorage.getItem("selectedTestType");
  
  const { data: testData, error } = await supabase
    .from("student_tests")
    .select("duration")
    .eq("auth_uid", studentId)
    .eq("section", currentSection)
    .eq("tipologia_esercizi", currentTipologiaEsercizi)
    .eq("progressivo", currentTestProgressivo)
    .eq("tipologia_test", selectedTestType)
    .single();
  
  if (error || !testData) {
    alert("Test not found.");
    return;
  }
  
  const durationSeconds = testData.duration;
  let endTime = Date.now() + durationSeconds * 1000;
  const timerInterval = setInterval(() => {
    const now = Date.now();
    const timeLeft = endTime - now;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("⏳ Time's up! Auto-submitting your answers.");
      submitAnswersBocconi();
      return;
    }
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    timerElement.textContent = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, 1000);
}

// Next button: Only forward navigation is allowed.
document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage < totalPages) {
    loadQuestionsForPage(currentPage + 1);
  }
});

// Detect Fullscreen Exit & Force Re-Entry
document.addEventListener("fullscreenchange", function () {
  if (isSubmitting) return;
  if (!document.fullscreenElement) {
    alert("⚠ The test has been cancelled. You are being redirected to your progress tree.");
    window.location.href = "test_selection.html";
  }
});

// Expose selectAnswerBocconi globally
window.selectAnswerBocconi = selectAnswerBocconi;