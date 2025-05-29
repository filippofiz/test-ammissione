import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const studentId = sessionStorage.getItem("selectedStudentId");
const studentName = sessionStorage.getItem("selectedStudentName");
const globalTestType = sessionStorage.getItem("selectedTestType");
document.getElementById("dashboardTitle").textContent = `Risultati di ${studentName}`;

if (!studentId) {
  alert("Error: No student selected.");
  window.location.href = "tutor_dashboard.html";
}

// Global variables for fetched data and chart instances.
let globalAnswers = [];
let globalQuestions = [];
let studentTestsData = [];
let chartInstances = {};

// Update tutor name in header
async function updateTutorName() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session) {
    const userId = sessionData.session.user.id;
    const { data: tutor } = await supabase
      .from("tutors")
      .select("name")
      .eq("auth_uid", userId)
      .single();
    
    if (tutor?.name) {
      const userNameElement = document.querySelector('.user-name');
      if (userNameElement) {
        userNameElement.textContent = tutor.name;
      }
    }
  }

  // Add logout event
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = "login.html";
  });
}

async function loadDashboard() {
  // Update tutor name after a delay to ensure header is loaded
  setTimeout(updateTutorName, 200);
  
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

  // Fetch student answers including the submitted_at timestamp.
  const { data: answers, error: answersError } = await supabase
    .from(answerTable)
    .select("answer, auto_score, question_id, submitted_at, test_id")
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
    updateAllVisualizations();
  });
  document.getElementById("tipologiaFilter").addEventListener("change", updateAllVisualizations);
  document.getElementById("progressivoFilter").addEventListener("change", updateAllVisualizations);
  document.getElementById("argomentoFilter").addEventListener("change", updateAllVisualizations);
  document.getElementById("linePlotArgomentoFilter").addEventListener("change", updateLineChart);

  updateAllVisualizations();
  populateLinePlotFilter();
}

function updateAllVisualizations() {
  filterDashboard();
  updateInteractiveTable();
  updateLineChart();
  updateRadarChart();
  updateBarChart();
  updateHeatmap();
}

function populateFiltersFromStudentTests(testsData) {
  const sectionFilter = document.getElementById("sectionFilter");
  const tipologiaFilter = document.getElementById("tipologiaFilter");
  const progressivoFilter = document.getElementById("progressivoFilter");
  const argomentoFilter = document.getElementById("argomentoFilter");

  const completedTests = testsData.filter(test => test.status === "completed");

  sectionFilter.innerHTML = `<option value="all">Tutte le Sezioni</option>`;
  tipologiaFilter.innerHTML = `<option value="all">Tutte le Tipologie</option>`;
  progressivoFilter.innerHTML = `<option value="all">Tutti i Progressivi</option>`;
  argomentoFilter.innerHTML = `<option value="all">Tutti gli Argomenti</option>`;

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
  
  // Count answers
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
  
  // Update stats cards
  const totalAnswers = filteredAnswers.length;
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("incorrectCount").textContent = incorrectCount;
  document.getElementById("correctPercentage").textContent = totalAnswers > 0 ? 
    `${((correctCount / totalAnswers) * 100).toFixed(1)}% del totale` : "0% del totale";
  document.getElementById("incorrectPercentage").textContent = totalAnswers > 0 ? 
    `${((incorrectCount / totalAnswers) * 100).toFixed(1)}% del totale` : "0% del totale";
  
  // Update completion rate
  const totalQuestions = filteredQuestions.length;
  const completionRate = totalQuestions > 0 ? ((totalAnswers / totalQuestions) * 100).toFixed(1) : 0;
  document.getElementById("completionRate").textContent = `${completionRate}%`;
  document.getElementById("progressFill").style.width = `${completionRate}%`;
  
  // Update pie chart
  updateEChartsPie(correctCount, incorrectCount, insicuroCount, nonHoIdeaCount, nonDatoCount);

  // Calculate and display scores
  if (
    sectionVal != "all" &&
    tipologiaVal != "all" &&
    progressivoVal != "all" &&
    argomentoVal === "all"
  ) {
    const score = calculateScore(filteredAnswers, 1);
    const score2 = calculateScore(filteredAnswers, 2);
    document.getElementById("totalScore").textContent = score.toFixed(2);
    scoreDisplay.textContent = `Modalità standard (${score})`;
    scoreDisplay2.textContent = `Score (1 for correct, -0.25 for incorrect, 0 otherwise): ${score2}`;
    scoreDisplay2.style.display = "block";
  } else {
    const score = calculateScore(filteredAnswers, 1);
    document.getElementById("totalScore").textContent = score.toFixed(2);
    scoreDisplay.textContent = "Modalità standard";
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

function updateEChartsPie(correctCount, incorrectCount, insicuroCount, nonHoIdeaCount, nonDatoCount) {
  const chartDom = document.getElementById('echartsPieContainer');
  if (!chartInstances.pie) {
    chartInstances.pie = echarts.init(chartDom);
  }
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: 'Risposte',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 20,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: correctCount, name: 'Corretto', itemStyle: { color: '#10b981' } },
          { value: incorrectCount, name: 'Incorretto', itemStyle: { color: '#ef4444' } },
          { value: insicuroCount, name: 'Insicuro', itemStyle: { color: '#3b82f6' } },
          { value: nonHoIdeaCount, name: 'Non ho idea', itemStyle: { color: '#f59e0b' } },
          { value: nonDatoCount, name: 'Non dato', itemStyle: { color: '#6b7280' } }
        ]
      }
    ]
  };

  chartInstances.pie.setOption(option);
}

function updateBarChart() {
  const chartDom = document.getElementById('barChartContainer');
  if (!chartInstances.bar) {
    chartInstances.bar = echarts.init(chartDom);
  }
  
  // Get filtered data
  const sectionVal = document.getElementById("sectionFilter").value;
  const tipologiaVal = document.getElementById("tipologiaFilter").value;
  const progressivoVal = document.getElementById("progressivoFilter").value;
  const argomentoVal = document.getElementById("argomentoFilter").value;
  
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
  
  // Group by argomento
  const argomentoStats = {};
  filteredQuestions.forEach(q => {
    if (!argomentoStats[q.argomento]) {
      argomentoStats[q.argomento] = { correct: 0, total: 0 };
    }
  });
  
  filteredAnswers.forEach(ans => {
    const question = filteredQuestions.find(q => q.id === ans.question_id);
    if (question) {
      argomentoStats[question.argomento].total++;
      if (ans.auto_score === 1) {
        argomentoStats[question.argomento].correct++;
      }
    }
  });
  
  const categories = Object.keys(argomentoStats);
  const correctPercentages = categories.map(cat => 
    argomentoStats[cat].total > 0 ? (argomentoStats[cat].correct / argomentoStats[cat].total * 100).toFixed(1) : 0
  );
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: '{b}: {c}%'
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '% Corrette',
      max: 100
    },
    series: [{
      name: 'Percentuale Corrette',
      type: 'bar',
      data: correctPercentages,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#10b981' },
          { offset: 1, color: '#059669' }
        ]),
        borderRadius: [8, 8, 0, 0]
      }
    }]
  };
  
  chartInstances.bar.setOption(option);
}

function updateRadarChart() {
  const chartDom = document.getElementById('radarChartContainer');
  if (!chartInstances.radar) {
    chartInstances.radar = echarts.init(chartDom);
  }
  
  // Get all argomenti and calculate performance
  const argomentoStats = {};
  globalQuestions.forEach(q => {
    if (!argomentoStats[q.argomento]) {
      argomentoStats[q.argomento] = { correct: 0, total: 0 };
    }
  });
  
  globalAnswers.forEach(ans => {
    const question = globalQuestions.find(q => q.id === ans.question_id);
    if (question) {
      argomentoStats[question.argomento].total++;
      if (ans.auto_score === 1) {
        argomentoStats[question.argomento].correct++;
      }
    }
  });
  
  const indicators = Object.keys(argomentoStats).map(arg => ({
    name: arg,
    max: 100
  }));
  
  const values = Object.keys(argomentoStats).map(arg => 
    argomentoStats[arg].total > 0 ? (argomentoStats[arg].correct / argomentoStats[arg].total * 100).toFixed(1) : 0
  );
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {},
    radar: {
      indicator: indicators,
      shape: 'polygon',
      splitNumber: 5,
      axisName: {
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: {
          color: '#e5e7eb'
        }
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.1)']
        }
      }
    },
    series: [{
      name: 'Competenze',
      type: 'radar',
      data: [{
        value: values,
        name: 'Performance',
        itemStyle: {
          color: '#3b82f6'
        },
        lineStyle: {
          width: 2
        },
        areaStyle: {
          color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.4)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
          ])
        }
      }]
    }]
  };
  
  chartInstances.radar.setOption(option);
}

function updateHeatmap() {
  const chartDom = document.getElementById('heatmapContainer');
  if (!chartInstances.heatmap) {
    chartInstances.heatmap = echarts.init(chartDom);
  }
  
  // Create a matrix of section vs tipologia performance
  const sections = Array.from(new Set(globalQuestions.map(q => q.section)));
  const tipologie = Array.from(new Set(globalQuestions.map(q => q.tipologia_esercizi)));
  
  const data = [];
  sections.forEach((section, sIdx) => {
    tipologie.forEach((tipologia, tIdx) => {
      const questions = globalQuestions.filter(q => 
        q.section === section && q.tipologia_esercizi === tipologia
      );
      const questionIds = questions.map(q => q.id);
      const answers = globalAnswers.filter(a => questionIds.includes(a.question_id));
      
      if (answers.length > 0) {
        const correctRate = answers.filter(a => a.auto_score === 1).length / answers.length * 100;
        data.push([tIdx, sIdx, correctRate.toFixed(1)]);
      }
    });
  });
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      formatter: function(params) {
        return `${sections[params.value[1]]} - ${tipologie[params.value[0]]}: ${params.value[2]}%`;
      }
    },
    grid: {
      height: '70%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: tipologie,
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'category',
      data: sections,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#ef4444', '#f59e0b', '#10b981']
      }
    },
    series: [{
      name: 'Performance',
      type: 'heatmap',
      data: data,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };
  
  chartInstances.heatmap.setOption(option);
}

function populateLinePlotFilter() {
  const lineFilter = document.getElementById("linePlotArgomentoFilter");
  lineFilter.innerHTML = "";
  lineFilter.innerHTML += `<option value="Totale">Totale</option>`;
  const argomenti = Array.from(new Set(globalQuestions.map(q => q.argomento).filter(a => a)));
  argomenti.forEach(arg => {
    lineFilter.innerHTML += `<option value="${arg}">${arg}</option>`;
  });
}

function updateLineChart() {
  const chartDom = document.getElementById('lineChartContainer');
  if (!chartInstances.line) {
    chartInstances.line = echarts.init(chartDom);
  }
  
  let filteredAnswers = globalAnswers;
  const selectedLineArg = document.getElementById("linePlotArgomentoFilter").value;
  
  if (selectedLineArg !== "Totale") {
    const questionsMap = {};
    globalQuestions.forEach(q => { questionsMap[q.id] = q; });
    filteredAnswers = filteredAnswers.filter(ans => {
      const q = questionsMap[ans.question_id];
      return q && q.argomento && q.argomento.toString() === selectedLineArg;
    });
  }
  
  const groupedByTest = {};
  filteredAnswers.forEach(ans => {
    const testId = ans.test_id || "unknown";
    if (!groupedByTest[testId]) {
      groupedByTest[testId] = [];
    }
    groupedByTest[testId].push(ans);
  });

  const testGroups = [];
  for (let testId in groupedByTest) {
    const testAnswers = groupedByTest[testId];
    const earliest = testAnswers.reduce((min, curr) => {
      return (!min || curr.submitted_at < min) ? curr.submitted_at : min;
    }, null);
    testGroups.push({ testId, earliest });
  }

  testGroups.sort((a, b) => a.earliest.localeCompare(b.earliest));
  const sortedTestIds = testGroups.map(group => group.testId);

  const categories = ["Corretto", "Incorretto", "Insicuro", "Non ho idea", "Non dato"];
  const seriesData = {
    "Corretto": [],
    "Incorretto": [],
    "Insicuro": [],
    "Non ho idea": [],
    "Non dato": []
  };

  const xLabels = [];

  sortedTestIds.forEach(testId => {
    const answersForTest = groupedByTest[testId];
    let counts = [0, 0, 0, 0, 0];
    answersForTest.forEach(ans => {
      if (ans.auto_score === 1) {
        counts[0]++;
      } else if (ans.auto_score === 0 && !["x", "y", "z"].includes(ans.answer)) {
        counts[1]++;
      } else if (ans.answer === "x") {
        counts[2]++;
      } else if (ans.answer === "y") {
        counts[3]++;
      } else if (ans.answer === "z") {
        counts[4]++;
      }
    });
    const total = counts.reduce((a, b) => a + b, 0);
    const percentages = counts.map(c => total > 0 ? Number(((c / total) * 100).toFixed(0)) : 0);
    categories.forEach((cat, idx) => {
      seriesData[cat].push(percentages[idx]);
    });
    
    const testRecord = studentTestsData.find(t => String(t.id) === testId);
    if (testRecord) {
      const label = `${testRecord.section}\n${testRecord.tipologia_esercizi} ${testRecord.progressivo}`;
      xLabels.push(label);
    } else {
      xLabels.push(testId);
    }
  });

  const colorMap = {
    "Corretto": "#10b981",
    "Incorretto": "#ef4444",
    "Insicuro": "#3b82f6",
    "Non ho idea": "#f59e0b",
    "Non dato": "#6b7280"
  };

  const option = {
    backgroundColor: 'transparent',
    tooltip: { 
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: { 
      data: categories,
      bottom: '5%'
    },
    grid: {
      bottom: '15%'
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: {
        formatter: function(value) {
          return value;
        },
        interval: 0,
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: 'Percentuale (%)',
      max: 100
    },
    series: categories.map(cat => ({
      name: cat,
      type: 'line',
      data: seriesData[cat],
      smooth: true,
      itemStyle: { color: colorMap[cat] },
      lineStyle: { width: 2 },
      emphasis: {
        focus: 'series'
      }
    }))
  };
  
  chartInstances.line.setOption(option);
}

// Build header structure for interactive table
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
          if (i === 4) {
            td.classList.add("double-border-right");
          }
          tr.appendChild(td);
        }
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
          } else {
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
        if (i === 4) {
          td.classList.add("double-border-right");
        }
        totalTr.appendChild(td);
      }
    }
  });

  tbody.appendChild(totalTr);
  table.appendChild(tbody);
  container.appendChild(table);
}

function filterInteractiveTable() {
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

function goBack() {
  window.history.back();
}

function openReport() {
  // Salva il file HTML del report
  const reportHTML = 'student-report.html';
  window.open(reportHTML, '_blank', 'width=1200,height=800');
}

// Resize charts on window resize
window.addEventListener('resize', () => {
  Object.values(chartInstances).forEach(chart => {
    chart.resize();
  });
});

loadDashboard();
window.goBack = goBack;
window.openReport = openReport;