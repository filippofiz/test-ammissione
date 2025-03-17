import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const studentId = sessionStorage.getItem("selectedStudentId");
const studentName = sessionStorage.getItem("selectedStudentName");
const globalTestType = sessionStorage.getItem("selectedTestType");
document.getElementById("dashboardTitle").textContent = `${studentName}'s Dashboard`;

if (!studentId) {
  alert("Error: No student selected.");
  window.location.href = "tutor_dashboard.html";
}

// Global variables for fetched data and chart instances.
let globalAnswers = [];
let globalQuestions = [];
let studentTestsData = []; // Data from student_tests for the current student & test type.
let chartInstance; // for the pie chart
let barChartInstance; // for the bar chart

async function loadDashboard() {
  // Set up the pie chart canvas.
  const pieCanvas = document.getElementById("resultsChart");
  pieCanvas.style.maxWidth = "400px";
  pieCanvas.style.maxHeight = "400px";
  pieCanvas.width = 400;
  pieCanvas.height = 400;

  // Set up the bar chart canvas (hidden by default).
  const barCanvas = document.getElementById("barChart");
  barCanvas.style.maxWidth = "400px";
  barCanvas.style.maxHeight = "400px";
  barCanvas.width = 400;
  barCanvas.height = 400;
  barCanvas.style.display = "none";

  // Make sure all four filters are visible.
  document.getElementById("sectionFilter").style.display = "inline-block";
  document.getElementById("tipologiaFilter").style.display = "inline-block";
  document.getElementById("progressivoFilter").style.display = "inline-block";
  document.getElementById("argomentoFilter").style.display = "inline-block";

  // Determine answer and question tables based on globalTestType.
  const answerTable = globalTestType.includes("PDF")
    ? "student_answers"
    : "studentbocconi_answers";
  const questionTable = globalTestType.includes("PDF")
    ? "questions"
    : "questions_bancaDati";

  // Fetch student answers.
  const { data: answers, error: answersError } = await supabase
    .from(answerTable)
    .select("answer, auto_score, question_id")
    .eq("auth_uid", studentId);
  if (answersError) {
    console.error("❌ Error fetching student answers:", answersError.message);
    return;
  }

  // Fetch questions (used for overall data and for argomento filter).
  const { data: questions, error: questionsError } = await supabase
    .from(questionTable)
    .select("id, section, tipologia_esercizi, progressivo, argomento")
    .eq("tipologia_test", globalTestType);
  if (questionsError) {
    console.error("❌ Error fetching questions:", questionsError.message);
    return;
  }

  globalAnswers = answers;
  globalQuestions = questions;

  // Fetch student_tests data for the current student and test type.
  // Note: We also select the "status" column.
  const { data: testsData, error: testsError } = await supabase
    .from("student_tests")
    .select("section, tipologia_esercizi, progressivo, status, id")
    .eq("auth_uid", studentId)
    .eq("tipologia_test", globalTestType);
  if (testsError) {
    console.error("❌ Error fetching student_tests data:", testsError.message);
    return;
  }
  studentTestsData = testsData;

  // Populate filters (only using tests with status "completed" for section, tipologia, progressivo)
  populateFiltersFromStudentTests(studentTestsData);

  // Add change listeners.
  document.getElementById("sectionFilter").addEventListener("change", () => {
    populateDependentFilters();
    filterDashboard();
  });
  document.getElementById("tipologiaFilter").addEventListener("change", filterDashboard);
  document.getElementById("progressivoFilter").addEventListener("change", filterDashboard);
  document.getElementById("argomentoFilter").addEventListener("change", filterDashboard);

  // Initially update the dashboard.
  filterDashboard();
}

// Populate filters (section, tipologia, progressivo) from student_tests data, using only completed tests.
function populateFiltersFromStudentTests(testsData) {
  const sectionFilter = document.getElementById("sectionFilter");
  const tipologiaFilter = document.getElementById("tipologiaFilter");
  const progressivoFilter = document.getElementById("progressivoFilter");

  // Use only tests with status "completed".
  const completedTests = testsData.filter(test => test.status === "completed");

  // Clear filters and add default "all" option.
  sectionFilter.innerHTML = `<option value="all">All Sections</option>`;
  tipologiaFilter.innerHTML = `<option value="all">All Tipologie</option>`;
  progressivoFilter.innerHTML = `<option value="all">All Progressivi</option>`;

  const sections = Array.from(new Set(completedTests.map(test => test.section)));
  const tipologie = Array.from(new Set(completedTests.map(test => test.tipologia_esercizi)));
  const progressivi = Array.from(new Set(completedTests.map(test => test.progressivo)));

  sections.forEach(s => {
    sectionFilter.innerHTML += `<option value="${s}">${s}</option>`;
  });
  tipologie.forEach(t => {
    tipologiaFilter.innerHTML += `<option value="${t}">${t}</option>`;
  });
  progressivi.forEach(p => {
    progressivoFilter.innerHTML += `<option value="${p}">${p}</option>`;
  });
}

// When a section is chosen, update dependent filters.
// Tipologia and Progressivo come from student_tests data (for that section, using completed tests).
// Argomento comes from the questions table, filtered by the chosen section.
function populateDependentFilters() {
  const sectionVal = document.getElementById("sectionFilter").value;
  const tipologiaFilter = document.getElementById("tipologiaFilter");
  const progressivoFilter = document.getElementById("progressivoFilter");
  const argomentoFilter = document.getElementById("argomentoFilter");

  let filteredTests = studentTestsData.filter(test => test.status === "completed");
  if (sectionVal !== "all") {
    filteredTests = filteredTests.filter(test => test.section.toString() === sectionVal);
  }

  tipologiaFilter.innerHTML = `<option value="all">All Tipologie</option>`;
  progressivoFilter.innerHTML = `<option value="all">All Progressivi</option>`;
  const tipologie = Array.from(new Set(filteredTests.map(test => test.tipologia_esercizi)));
  const progressivi = Array.from(new Set(filteredTests.map(test => test.progressivo)));
  tipologie.forEach(t => {
    tipologiaFilter.innerHTML += `<option value="${t}">${t}</option>`;
  });
  progressivi.forEach(p => {
    progressivoFilter.innerHTML += `<option value="${p}">${p}</option>`;
  });

  // For argomento, use globalQuestions filtered by section.
  let filteredQuestions = globalQuestions;
  if (sectionVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.section.toString() === sectionVal);
  }
  argomentoFilter.innerHTML = `<option value="all">All Argomenti</option>`;
  const argomenti = Array.from(new Set(filteredQuestions.map(q => q.argomento).filter(a => a)));
  argomenti.forEach(a => {
    argomentoFilter.innerHTML += `<option value="${a}">${a}</option>`;
  });
}

function filterDashboard() {
  // Get filter values.
  const sectionVal = document.getElementById("sectionFilter").value;
  const tipologiaVal = document.getElementById("tipologiaFilter").value;
  const progressivoVal = document.getElementById("progressivoFilter").value;
  const argomentoVal = document.getElementById("argomentoFilter").value;
  const scoreDisplay = document.getElementById("scoreDisplay");
  const scoreDisplay2 = document.getElementById("scoreDisplay2");

  // Filter student_tests data by section, tipologia, and progressivo.
  let filteredTests = studentTestsData.filter(test => test.status === "completed");
  if (sectionVal !== "all") {
    filteredTests = filteredTests.filter(q => q.section.toString() === sectionVal);
  }
  if (tipologiaVal !== "all") {
    filteredTests = filteredTests.filter(q => Number(q.tipologia_esercizi) === Number(tipologiaVal));
  }
  if (progressivoVal !== "all") {
    filteredTests = filteredTests.filter(q => Number(q.progressivo) === Number(progressivoVal));
  }

  console.log("Filtered Tests:", filteredTests);
  // For argomento, filter globalQuestions by section and by chosen argomento.
  let filteredQuestions = globalQuestions;
  if (sectionVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.section.toString() === sectionVal);
  }
  
  if (argomentoVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.argomento.toString() === argomentoVal);
  }

  if (progressivoVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => Number(q.progressivo) === Number(progressivoVal));
  }  
  
  console.log("Filtered Questions:", filteredQuestions);

  // Allowed question IDs from filtered student_tests data.
  const allowedQuestionIds = new Set(filteredQuestions.map(q => q.id));
  console.log("Allowed Question IDs:", allowedQuestionIds);
  console.log("Global Answers:", globalAnswers);
  const filteredAnswers = globalAnswers.filter(ans => allowedQuestionIds.has(ans.question_id));

  console.log("Filtered Answers:", filteredAnswers);

  // Update the pie chart.
  updateChart(filteredAnswers);

  // For the bar chart: if section, tipologia, and progressivo are all "all" and argomento is "all", show the bar chart.
  const barCanvas = document.getElementById("barChart");
  if (
    sectionVal === "all" &&
    tipologiaVal === "all" &&
    progressivoVal === "all" &&
    argomentoVal === "all"
  ) {
    barCanvas.style.display = "block";
    updateBarChart(filteredAnswers, filteredQuestions);
  } else {
    if (barChartInstance) {
      barChartInstance.destroy();
      barChartInstance = null;
    }
    barCanvas.style.display = "none";
  }

  // Show scores only if all four filters are "all".
  if (
    sectionVal != "all" &&
    tipologiaVal != "all" &&
    progressivoVal != "all" &&
    argomentoVal === "all"
  ) {
    const score = calculateScore(filteredAnswers, 1);
    scoreDisplay.textContent = `Score (1 for correct, 0 otherwise): ${score}`;
    const score2 = calculateScore(filteredAnswers, 2);
    scoreDisplay2.textContent = `Score (1 for correct, -0.25 for incorrect, 0 otherwise): ${score2}`;
    scoreDisplay.style.display = "block";
    scoreDisplay2.style.display = "block";
  } else {
    scoreDisplay.style.display = "none";
    scoreDisplay2.style.display = "none";
  }
}

function calculateScore(answers, modality) {
  let score = 0;
  answers.forEach(ans => {
    if (modality === 1) {
      score += ans.auto_score === 1 ? 1 : 0;
    } else if (modality === 2) {
      if (ans.auto_score === 1) {
        score += 1;
      } else if (ans.auto_score === 0 && !["x", "y", "z"].includes(ans.answer)) {
        score -= 0.25;
      }
    }
  });
  return score;
}

function updateChart(answers) {
  if (chartInstance) {
    chartInstance.destroy();
  }
  const categories = { correct: 0, wrong: 0, insicuro: 0, "non ho idea": 0, "non dato": 0 };
  answers.forEach(d => {
    if (d.auto_score === 1) {
      categories.correct++;
    } else if (d.auto_score === 0 && !["x", "y", "z"].includes(d.answer)) {
      categories.wrong++;
    } else if (d.answer === "x") {
      categories.insicuro++;
    } else if (d.answer === "y") {
      categories["non ho idea"]++;
    } else {
      categories["non dato"]++;
    }
  });
  const ctx = document.getElementById("resultsChart").getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(categories),
      datasets: [{
        data: Object.values(categories),
        backgroundColor: ["green", "red", "blue", "orange", "gray"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            const dataArr = context.chart.data.datasets[0].data;
            const total = dataArr.reduce((acc, val) => acc + val, 0);
            if (total === 0) return '';
            const percentage = ((value / total) * 100).toFixed(2);
            return Number(percentage) === 0 ? '' : percentage + '%';
          },
          color: "#fff",
          font: { weight: "bold" }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function updateBarChart(filteredAnswers, filteredQuestions) {
  // Group by section and exercise (using test_number) for the chosen argomento.
  const groups = {};
  filteredQuestions.forEach(q => {
    const key = `${q.section}-${q.test_number}`;
    if (!groups[key]) {
      groups[key] = { total: 0, correct: 0, section: q.section, test_number: q.test_number };
    }
    groups[key].total++;
  });
  const questionGroupMap = {};
  filteredQuestions.forEach(q => {
    questionGroupMap[q.id] = `${q.section}-${q.test_number}`;
  });
  filteredAnswers.forEach(ans => {
    const key = questionGroupMap[ans.question_id];
    if (key && ans.auto_score === 1) {
      groups[key].correct++;
    }
  });
  const groupKeys = Object.keys(groups).sort((a, b) => {
    const [s1, t1] = a.split("-").map(Number);
    const [s2, t2] = b.split("-").map(Number);
    return s1 === s2 ? t1 - t2 : s1 - s2;
  });
  const labels = [];
  const data = [];
  groupKeys.forEach(key => {
    const group = groups[key];
    const percentage = group.total ? (group.correct / group.total * 100) : 0;
    // Assuming sections_arr and exercises_arr exist for labeling.
    const sectionName = sections_arr[group.section - 1];
    let exerciseName;
    if (group.section === 7) {
      exerciseName = `Simulazione ${group.test_number}`;
    } else {
      exerciseName = exercises_arr[group.test_number - 1] || `Exercise ${group.test_number}`;
    }
    labels.push(`${sectionName} - ${exerciseName}`);
    data.push(percentage.toFixed(2));
  });
  
  const ctx = document.getElementById("barChart").getContext("2d");
  if (barChartInstance) {
    barChartInstance.destroy();
  }
  barChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Percentage Correct",
        data: data,
        backgroundColor: "blue"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: value => value + '%'
          }
        }
      },
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            if (Number(value) === 0) return '';
            return value + '%';
          },
          color: "#fff",
          font: { weight: "bold" }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

function goBack() {
  window.history.back();
}

loadDashboard();
window.goBack = goBack;