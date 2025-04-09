import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const studentId = sessionStorage.getItem("selectedStudentId");
const studentName = sessionStorage.getItem("selectedStudentName");
const globalTestType = sessionStorage.getItem("selectedTestType");
document.getElementById("dashboardTitle").textContent = `Risultati dei test di ${studentName}`;

if (!studentId) {
  alert("Error: No student selected.");
  window.location.href = "tutor_dashboard.html";
}

// Global variables for fetched data and chart instances.
let globalAnswers = [];
let globalQuestions = [];
let studentTestsData = []; // Data from student_tests for the current student & test type.

async function loadDashboard() {
  // Make sure all filters are visible.
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

  // Fetch questions.
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

  // Fetch student_tests data.
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

  populateFiltersFromStudentTests(studentTestsData);

  document.getElementById("sectionFilter").addEventListener("change", () => {
    populateDependentFilters();
    filterDashboard();
    updateInteractiveTable();
  });
  document.getElementById("tipologiaFilter").addEventListener("change", () => {
    filterDashboard();
    updateInteractiveTable();
  });
  document.getElementById("progressivoFilter").addEventListener("change", () => {
    filterDashboard();
    updateInteractiveTable();
  });
  document.getElementById("argomentoFilter").addEventListener("change", () => {
    filterDashboard();
    updateInteractiveTable();
  });

  filterDashboard();
  updateInteractiveTable();
}

function populateFiltersFromStudentTests(testsData) {
  const sectionFilter = document.getElementById("sectionFilter");
  const tipologiaFilter = document.getElementById("tipologiaFilter");
  const progressivoFilter = document.getElementById("progressivoFilter");

  const completedTests = testsData.filter(test => test.status === "completed");

  sectionFilter.innerHTML = `<option value="all">Tutte le Sezioni</option>`;
  tipologiaFilter.innerHTML = `<option value="all">Tutte le Tipologie</option>`;
  progressivoFilter.innerHTML = `<option value="all">Tutti i Progressivi</option>`;

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

function populateDependentFilters() {
  const sectionVal = document.getElementById("sectionFilter").value;
  const tipologiaFilter = document.getElementById("tipologiaFilter");
  const progressivoFilter = document.getElementById("progressivoFilter");
  const argomentoFilter = document.getElementById("argomentoFilter");

  let filteredTests = studentTestsData.filter(test => test.status === "completed");
  if (sectionVal !== "all") {
    filteredTests = filteredTests.filter(test => test.section.toString() === sectionVal);
  }

  tipologiaFilter.innerHTML = `<option value="all">Tutte le Tipologie</option>`;
  progressivoFilter.innerHTML = `<option value="all">Tutti i Progressivi</option>`;
  const tipologie = Array.from(new Set(filteredTests.map(test => test.tipologia_esercizi)));
  const progressivi = Array.from(new Set(filteredTests.map(test => test.progressivo)));
  tipologie.forEach(t => {
    tipologiaFilter.innerHTML += `<option value="${t}">${t}</option>`;
  });
  progressivi.forEach(p => {
    progressivoFilter.innerHTML += `<option value="${p}">${p}</option>`;
  });

  let filteredQuestions = globalQuestions;
  if (sectionVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.section.toString() === sectionVal);
  }
  argomentoFilter.innerHTML = `<option value="all">Tutti gli Argomenti</option>`;
  const argomenti = Array.from(new Set(filteredQuestions.map(q => q.argomento).filter(a => a)));
  argomenti.forEach(a => {
    argomentoFilter.innerHTML += `<option value="${a}">${a}</option>`;
  });
}

function filterDashboard() {
  const sectionVal = document.getElementById("sectionFilter").value;
  const tipologiaVal = document.getElementById("tipologiaFilter").value;
  const progressivoVal = document.getElementById("progressivoFilter").value;
  const argomentoVal = document.getElementById("argomentoFilter").value;
  const scoreDisplay = document.getElementById("scoreDisplay");
  const scoreDisplay2 = document.getElementById("scoreDisplay2");

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
  
  const allowedQuestionIds = new Set(filteredQuestions.map(q => q.id));
  const filteredAnswers = globalAnswers.filter(ans => allowedQuestionIds.has(ans.question_id));
  // Assuming 'filteredAnswers' is already computed:
  let correctCount = 0, incorrectCount = 0, insicuroCount = 0, nonHoIdeaCount = 0, nonDatoCount = 0;
  filteredAnswers.forEach(d => {
    if (d.auto_score === 1) {
      correctCount++;
    } else if (d.auto_score === 0 && !["x", "y", "z"].includes(d.answer)) {
      incorrectCount++;
    } else if (d.answer === "x") {
      insicuroCount++;
    } else if (d.answer === "y") {
      nonHoIdeaCount++;
    } else {
      nonDatoCount++;
    }
  });
  updateEChartsPie(correctCount, incorrectCount, insicuroCount, nonHoIdeaCount, nonDatoCount);

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


function goBack() {
  window.history.back();
}

// Build a nested header structure for the interactive table.
function buildHeaderStructureInt(questionsData) {
  const structure = {};
  questionsData.forEach(q => {
    if (!structure[q.section]) {
      structure[q.section] = {};
    }
    if (!structure[q.section][q.tipologia_esercizi]) {
      structure[q.section][q.tipologia_esercizi] = new Set();
    }
    structure[q.section][q.tipologia_esercizi].add(q.progressivo);
  });
  for (const section in structure) {
    for (const tipologia in structure[section]) {
      structure[section][tipologia] = Array.from(structure[section][tipologia]).sort((a, b) => a - b);
    }
  }
  return structure;
}

// Flatten header structure into an ordered array.
function buildHeaderDefinitionsInt(structure) {
  const headerDefs = [];
  const sections = Object.keys(structure).sort();
  sections.forEach(section => {
    const tipologie = Object.keys(structure[section]).sort();
    tipologie.forEach(tipologia => {
      structure[section][tipologia].forEach(progressivo => {
        headerDefs.push({ section, tipologia, progressivo });
      });
    });
  });
  return headerDefs;
}

function generateInteractiveTable(questionsData, answersData) {
  const container = document.getElementById("interactiveTableContainer");
  container.innerHTML = "";
  const table = document.createElement("table");
  const displayAll = true;

  const headerStructure = buildHeaderStructureInt(questionsData);
  const headerDefs = buildHeaderDefinitionsInt(headerStructure);

  const thead = document.createElement("thead");

  // Header Row 1: Sections
  const headerRow1 = document.createElement("tr");
  const emptyTh = document.createElement("th");
  emptyTh.rowSpan = 4;
  emptyTh.textContent = "";
  headerRow1.appendChild(emptyTh);

  Object.keys(headerStructure).sort().forEach(section => {
    let colCount = 0;
    const tipologie = headerStructure[section];
    for (const tipologia in tipologie) {
      colCount += tipologie[tipologia].length * (displayAll ? 5 : 1);
    }
    const th = document.createElement("th");
    th.textContent = section;
    th.colSpan = colCount;
    headerRow1.appendChild(th);
  });
  thead.appendChild(headerRow1);

  // Header Row 2: Tipologia
  const headerRow2 = document.createElement("tr");
  Object.keys(headerStructure).sort().forEach(section => {
    const tipologie = headerStructure[section];
    Object.keys(tipologie).sort().forEach(tipologia => {
      const colCount = tipologie[tipologia].length * (displayAll ? 5 : 1);
      const th = document.createElement("th");
      th.textContent = tipologia;
      th.colSpan = colCount;
      headerRow2.appendChild(th);
    });
  });
  thead.appendChild(headerRow2);

  // Header Row 3: Progressivo
  const headerRow3 = document.createElement("tr");
  Object.keys(headerStructure).sort().forEach(section => {
    const tipologie = headerStructure[section];
    Object.keys(tipologie).sort().forEach(tipologia => {
      tipologie[tipologia].forEach(progressivo => {
        const th = document.createElement("th");
        th.textContent = progressivo;
        th.colSpan = (displayAll ? 5 : 1);
        th.classList.add("double-border-right");
        headerRow3.appendChild(th);
      });
    });
  });
  thead.appendChild(headerRow3);

  // Header Row 4: Answers
  const headerRow4 = document.createElement("tr");
  headerDefs.forEach(() => {
    if (displayAll) {
      ["Corretto", "Incorretto", "Insicuro", "Non ho idea", "Non dato"].forEach(label => {
        const th = document.createElement("th");
        th.textContent = label;
        headerRow4.appendChild(th);
      });
    } else {
      const labels = ["Corretto", "Incorretto", "Insicuro", "Non ho idea", "Non dato"];
      const th = document.createElement("th");
      th.textContent = labels[selectedIndex];
      if (selectedIndex === 4) { // After last answer category
        th.classList.add("double-border-right");
      }
      headerRow4.appendChild(th);
    }
  });
  thead.appendChild(headerRow4);

  table.appendChild(thead);

  // Body
  const tbody = document.createElement("tbody");

  const answersMap = {};
  answersData.forEach(ans => {
    answersMap[ans.question_id] = ans;
  });

  const questionsMap = {};
  questionsData.forEach(q => {
    const key = q.section + "|" + q.tipologia_esercizi + "|" + q.progressivo + "|" + q.argomento;
    if (!questionsMap[key]) {
      questionsMap[key] = [];
    }
    questionsMap[key].push(q);
  });

  const argomenti = Array.from(new Set(questionsData.map(q => q.argomento))).sort();
  const totals = {};
  headerDefs.forEach((def, idx) => {
    totals[idx] = displayAll ? [0, 0, 0, 0, 0] : [0];
  });

  argomenti.forEach(argomento => {
    const tr = document.createElement("tr");
    const thArg = document.createElement("th");
    thArg.textContent = argomento;
    tr.appendChild(thArg);

    headerDefs.forEach((def, idx) => {
      const key = def.section + "|" + def.tipologia + "|" + def.progressivo + "|" + argomento;
      const counts = [0, 0, 0, 0, 0];

      if (questionsMap[key]) {
        questionsMap[key].forEach(q => {
          const ansRecord = answersMap[q.id];
          if (ansRecord) {
            if (ansRecord.auto_score === 1) counts[0]++;
            else if (ansRecord.answer === "x") counts[2]++;
            else if (ansRecord.answer === "y") counts[3]++;
            else if (ansRecord.answer === "z") counts[4]++;
            else counts[1]++;
          }
        });
      }

      const total = counts.reduce((a, b) => a + b, 0);

      if (displayAll) {
        for (let i = 0; i < 5; i++) {
          const td = document.createElement("td");
          if (total === 0) {
            td.textContent = "-";
          } else {
            if (counts[i] === 0) {
              td.textContent = "0";
            } else {
              td.textContent = `${counts[i]} (${((counts[i] / total) * 100).toFixed(0)}%)`;
            }
          }
          if (counts[i] > 0) {
            if (i === 0) td.classList.add("correct-light");
            if (i === 1) td.classList.add("incorrect-light");
            if (i === 2) td.classList.add("x-answer-light");
            if (i === 3) td.classList.add("y-answer-light");
            if (i === 4) td.classList.add("z-answer-light");
            totals[idx][i] += counts[i];
          }
          if (i === 4) {  // After last column of a progressivo
            td.classList.add("double-border-right");
          }
          tr.appendChild(td);
        }
      } else {
        const td = document.createElement("td");
        if (total === 0) {
          td.textContent = "-";
        } else {
          if (counts[selectedIndex] > 0) {
            td.textContent = `${counts[selectedIndex]} (${((counts[selectedIndex] / total) * 100).toFixed(0)}%)`;
          } else {
            td.textContent = counts[selectedIndex];
          }
        }
        if (counts[selectedIndex] > 0) {
          if (selectedIndex === 0) td.classList.add("correct-light");
          if (selectedIndex === 1) td.classList.add("incorrect-light");
          if (selectedIndex === 2) td.classList.add("x-answer-light");
          if (selectedIndex === 3) td.classList.add("y-answer-light");
          if (selectedIndex === 4) td.classList.add("z-answer-light");
          totals[idx][0] += counts[selectedIndex];
        }
        tr.appendChild(td);
      }
    });
    tbody.appendChild(tr);
  });

  // Totals Row
  const totalTr = document.createElement("tr");
  const thTotal = document.createElement("th");
  thTotal.textContent = "Totale";
  totalTr.appendChild(thTotal);

  headerDefs.forEach((def, idx) => {
    if (displayAll) {
      const sumTotal = totals[idx].reduce((a, b) => a + b, 0);
      for (let i = 0; i < 5; i++) {
        const td = document.createElement("td");
        if (sumTotal === 0) {
          td.textContent = "-";
        } else {
          if (totals[idx][i] > 0) {
            td.textContent = `${totals[idx][i]} (${((totals[idx][i] / sumTotal) * 100).toFixed(0)}%)`;
          }
          else {
            td.textContent = totals[idx][i];
          }
          
        }
        if (totals[idx][i] > 0) {
          if (i === 0) td.classList.add("corretto");
          if (i === 1) td.classList.add("incorretto");
          if (i === 2) td.classList.add("x-answer");
          if (i === 3) td.classList.add("y-answer");
          if (i === 4) td.classList.add("z-answer");
        }
        if (i === 4) { // After last column of a progressivo
          td.classList.add("double-border-right");
        }
        totalTr.appendChild(td);
      }
    } else {
      const td = document.createElement("td");
      const val = totals[idx][0];
      if (val === 0) {
        td.textContent = "-";
      } else {
        td.textContent = `${val} (100%)`;
      }
      if (val > 0) {
        if (selectedIndex === 0) td.classList.add("corretto");
        if (selectedIndex === 1) td.classList.add("incorretto");
        if (selectedIndex === 2) td.classList.add("x-answer");
        if (selectedIndex === 3) td.classList.add("y-answer");
        if (selectedIndex === 4) td.classList.add("z-answer");
      }
      totalTr.appendChild(td);
    }
  });

  tbody.appendChild(totalTr);
  table.appendChild(tbody);
  container.appendChild(table);
}

function filterInteractiveTable() {
  // Use common filters.
  const sectionVal = document.getElementById("sectionFilter").value;
  const tipologiaVal = document.getElementById("tipologiaFilter").value;
  const progressivoVal = document.getElementById("progressivoFilter").value;
  const argomentoVal = document.getElementById("argomentoFilter").value;

  let filteredQuestions = globalQuestions.slice();
  if (sectionVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.section === sectionVal);
  }
  if (tipologiaVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.tipologia_esercizi === tipologiaVal);
  }
  if (progressivoVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.progressivo === Number(progressivoVal));
  }
  if (argomentoVal !== "all") {
    filteredQuestions = filteredQuestions.filter(q => q.argomento === argomentoVal);
  }
  const filteredAnswers = globalAnswers.filter(a => 
    filteredQuestions.some(q => q.id === a.question_id)
  );
  return { filteredQuestions, filteredAnswers };
}

function updateInteractiveTable() {
  const { filteredQuestions, filteredAnswers } = filterInteractiveTable();
  generateInteractiveTable(filteredQuestions, filteredAnswers);
}

function updateEChartsPie(correctCount, incorrectCount, insicuroCount, nonHoIdeaCount, nonDatoCount) {
  const chartDom = document.getElementById('echartsPieContainer');
  const myChart = echarts.init(chartDom);
  
  const option = {
    backgroundColor: '#2c343c',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        name: 'Answers',
        type: 'pie',
        radius: ['40%', '70%'], // Inner radius and outer radius
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        },
        label: {
          show: true,
          position: 'outside',
          fontSize: 16,
          color: '#fff',
          formatter: '{b}: {d}%'
        },
        labelLine: {
          show: true,
          length: 20,
          length2: 30,
          smooth: true,
          lineStyle: {
            width: 2
          }
        },
        emphasis: {
          scale: true,
          scaleSize: 10,
          itemStyle: {
            shadowBlur: 30,
            shadowColor: 'rgba(0, 0, 0, 0.8)'
          }
        },
        data: [
          { value: correctCount, name: 'Corretto', itemStyle: { color: '#4CAF50' } },
          { value: incorrectCount, name: 'Incorretto', itemStyle: { color: '#F44336' } },
          { value: insicuroCount, name: 'Insicuro', itemStyle: { color: '#2196F3' } },
          { value: nonHoIdeaCount, name: 'Non ho idea', itemStyle: { color: '#FFC107' } },
          { value: nonDatoCount, name: 'Non dato', itemStyle: { color: '#9E9E9E' } }
        ]
      }
    ]
  };

  myChart.setOption(option);
}

loadDashboard();
window.goBack = goBack;