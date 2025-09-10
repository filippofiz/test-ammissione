const supabase = window.supabase;

document.addEventListener("DOMContentLoaded", () => {
    const signupBtn = document.getElementById("signupBtn");
  
    if (!signupBtn) {
      console.error("❌ ERROR: Signup button not found.");
      return;
    }
  
    signupBtn.addEventListener("click", async () => {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();
      const fullName = document.getElementById("fullName").value.trim();
      const tutorId = document.getElementById("tutorDropdown").value;
      const testsDropdown = document.getElementById("testsDropdown");
      const chosenTests = Array.from(testsDropdown.selectedOptions).map(opt => opt.value);
      
      // Reset messaggi
      hideMessages();
  
      // Validazioni
      if (!email || !password || !confirmPassword || !fullName || !tutorId || chosenTests.length === 0) {
        showError("Compila tutti i campi e seleziona almeno un test.");
        return;
      }

      if (password !== confirmPassword) {
        showError("Le password non corrispondono.");
        return;
      }

      if (password.length < 6) {
        showError("La password deve essere di almeno 6 caratteri.");
        return;
      }

      // Validazione email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showError("Inserisci un indirizzo email valido.");
        return;
      }
  
      await registerStudent(email, password, fullName, tutorId, chosenTests);
    });
});

async function registerStudent(email, password, fullName, tutorId, chosenTests) {
    try {
        console.log("🔄 Registrazione studente:", email);
        
        // Disabilita il bottone durante la registrazione
        const signupBtn = document.getElementById("signupBtn");
        signupBtn.disabled = true;
        signupBtn.textContent = "Registrazione in corso...";
        
        // Registra l'utente con Supabase Auth
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) {
            console.error("❌ Registrazione fallita:", error.message);
            
            if (error.message.includes("already registered")) {
                showError("This email address is already registered in the system.");
            } else {
                showError("Registration error: " + error.message);
            }
            return;
        }

        const user = data.user;
        console.log("✅ Utente creato! Auth UID:", user.id);

        // Attendi un momento per assicurarsi che Supabase abbia processato l'utente
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Inserisci lo studente nel database
        const { error: insertError } = await supabase
            .from("students")
            .insert([{ 
                auth_uid: user.id, 
                email, 
                name: fullName, 
                tutor_id: tutorId, 
                tests: chosenTests,
                password_set: true // La password è già stata impostata
            }]);

        if (insertError) {
            console.error("❌ Errore salvataggio info studente:", insertError.message);
            showError("Error saving information. Account was created but please contact support.");
            return;
        }

        // Inizializza i test per lo studente
        try {
            await initializeStudentTests(user.id, chosenTests);
        } catch (testError) {
            console.error("❌ Errore inizializzazione test:", testError);
            // Non bloccare il processo se l'inizializzazione test fallisce
        }
        
        // Successo!
        showSuccess(`✅ Studente registrato con successo!\n\nLo studente può ora accedere con:\nEmail: ${email}\nPassword: quella appena impostata`);

        // Pulisci il form
        clearForm();
        
        // Redirect alla dashboard tutor dopo 2 secondi
        setTimeout(() => {
            window.location.href = "tutor_dashboard.html";
        }, 2000);

    } catch (err) {
        console.error("❌ Errore imprevisto:", err);
        showError("An unexpected error occurred. Please try again.");
    } finally {
        // Riabilita il bottone
        const signupBtn = document.getElementById("signupBtn");
        signupBtn.disabled = false;
        signupBtn.textContent = "Registra Studente";
    }
}

// Funzione per inizializzare i test dello studente
async function initializeStudentTests(authUid, chosenTests) {
    console.log("📌 Inizializzazione test per:", authUid);
  
    const testEntries = [];
  
    // Recupera test dalle domande PDF
    // Fetch PDF tests with pagination
    let pdfTests = [];
    let page = 0;
    let hasMore = true;
    while (hasMore) {
      const { data, error } = await supabase
        .from("questions")
        .select("section, tipologia_esercizi, progressivo, tipologia_test")
        .in("tipologia_test", chosenTests)
        .order("progressivo")
        .range(page * 1000, (page + 1) * 1000 - 1);
      
      if (error || !data || data.length === 0) {
        hasMore = false;
      } else {
        pdfTests = [...pdfTests, ...data];
        if (data.length < 1000) hasMore = false;
        page++;
      }
    }
    const pdfError = null;
  
    if (pdfError) {
      console.error("❌ Errore recupero test PDF:", pdfError.message);
    } else if (pdfTests) {
      // Rimuovi duplicati
      const uniquePdfTests = Array.from(
        new Set(pdfTests.map(test => `${test.section}|${test.tipologia_esercizi}|${test.progressivo}|${test.tipologia_test}`))
      ).map(key => {
        const parts = key.split("|");
        return { 
            section: parts[0], 
            tipologia_esercizi: parts[1], 
            progressivo: Number(parts[2]), 
            tipologia_test: parts[3]
        };
      });
  
      uniquePdfTests.forEach(test => {
        testEntries.push({
          auth_uid: authUid,
          section: test.section,
          tipologia_esercizi: test.tipologia_esercizi,
          progressivo: test.progressivo,
          tipologia_test: test.tipologia_test,
          status: "locked",
          unlock_mode: "manual",
          unlock_order: 0
        });
      });
    }
  
    // Recupera test dalla banca dati
    // Fetch Banca Dati tests with pagination
    let bancaDatiTests = [];
    page = 0;
    hasMore = true;
    while (hasMore) {
      const { data, error } = await supabase
        .from("questions_bancaDati")
        .select("section, tipologia_esercizi, progressivo, tipologia_test")
        .in("tipologia_test", chosenTests)
        .order("progressivo")
        .range(page * 1000, (page + 1) * 1000 - 1);
      
      if (error || !data || data.length === 0) {
        hasMore = false;
      } else {
        bancaDatiTests = [...bancaDatiTests, ...data];
        if (data.length < 1000) hasMore = false;
        page++;
      }
    }
    const bancaDatiError = null;
  
    if (bancaDatiError) {
      console.error("❌ Errore recupero test banca dati:", bancaDatiError.message);
    } else if (bancaDatiTests) {
      const uniqueBancaDatiTests = Array.from(
        new Set(bancaDatiTests.map(test => `${test.section}|${test.tipologia_esercizi}|${test.progressivo || 1}|${test.tipologia_test}`))
      ).map(key => {
        const parts = key.split("|");
        return { 
            section: parts[0], 
            tipologia_esercizi: parts[1], 
            progressivo: Number(parts[2]), 
            tipologia_test: parts[3]
        };
      });
  
      uniqueBancaDatiTests.forEach(test => {
        testEntries.push({
          auth_uid: authUid,
          section: test.section,
          tipologia_esercizi: test.tipologia_esercizi,
          progressivo: test.progressivo,
          tipologia_test: test.tipologia_test,
          status: "locked",
          unlock_mode: "manual",
          unlock_order: 0
        });
      });
    }
  
    if (testEntries.length > 0) {
      const { error: insertError } = await supabase
        .from("student_tests")
        .insert(testEntries);
  
      if (insertError) {
        console.error("❌ Errore inizializzazione test:", insertError.message);
        throw insertError;
      } else {
        console.log("✅ Test inizializzati con successo!");
      }
    }
}

// Funzioni di utilità
function showError(message) {
    const errorDiv = document.getElementById("errorMessage");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    // Nascondi dopo 5 secondi
    setTimeout(() => {
        errorDiv.style.display = "none";
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById("successMessage");
    successDiv.textContent = message;
    successDiv.style.display = "block";
    // Nascondi dopo 10 secondi
    setTimeout(() => {
        successDiv.style.display = "none";
    }, 10000);
}

function hideMessages() {
    document.getElementById("errorMessage").style.display = "none";
    document.getElementById("successMessage").style.display = "none";
}

function clearForm() {
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("confirmPassword").value = "";
    document.getElementById("fullName").value = "";
    document.getElementById("tutorDropdown").value = "";
    Array.from(document.getElementById("testsDropdown").options).forEach(opt => opt.selected = false);
}

// Carica i tutor disponibili
async function loadTutors() {
    const tutorDropdown = document.getElementById("tutorDropdown");
  
    const { data, error } = await supabase
      .from("tutors")
      .select("id, name")
      .order("name");
  
    if (error) {
      console.error("❌ Errore caricamento tutor:", error.message);
      showError("Error loading tutors.");
      return;
    }
  
    tutorDropdown.innerHTML = '<option value="">-- Scegli un tutor --</option>';
  
    data.forEach(tutor => {
      let option = document.createElement("option");
      option.value = tutor.id;
      option.textContent = tutor.name;
      tutorDropdown.appendChild(option);
    });
}

// Carica le opzioni dei test
async function loadTestOptions() {
    // Fetch questions with pagination
    let questionsData = [];
    let page = 0;
    let hasMore = true;
    while (hasMore) {
      const { data, error } = await supabase
        .from("questions")
        .select("tipologia_test")
        .range(page * 1000, (page + 1) * 1000 - 1);
      
      if (error || !data || data.length === 0) {
        hasMore = false;
      } else {
        questionsData = [...questionsData, ...data];
        if (data.length < 1000) hasMore = false;
        page++;
      }
    }
    const questionsError = null;
    
    // Fetch banca dati with pagination
    let bancaDatiData = [];
    page = 0;
    hasMore = true;
    while (hasMore) {
      const { data, error } = await supabase
        .from("questions_bancaDati")
        .select("tipologia_test")
        .range(page * 1000, (page + 1) * 1000 - 1);
      
      if (error || !data || data.length === 0) {
        hasMore = false;
      } else {
        bancaDatiData = [...bancaDatiData, ...data];
        if (data.length < 1000) hasMore = false;
        page++;
      }
    }
    const bancaDatiError = null;
  
    if (questionsError) {
      console.error("❌ Errore caricamento test PDF:", questionsError.message);
    }
    if (bancaDatiError) {
      console.error("❌ Errore caricamento test banca dati:", bancaDatiError.message);
    }
  
    let options = [];
    
    // Aggiungi test unici dalle domande PDF
    if (questionsData) {
      questionsData.forEach(row => {
        if (row.tipologia_test && !options.includes(row.tipologia_test)) {
          options.push(row.tipologia_test);
        }
      });
    }
    
    // Aggiungi test unici dalla banca dati
    if (bancaDatiData) {
      bancaDatiData.forEach(row => {
        if (row.tipologia_test && !options.includes(row.tipologia_test)) {
          options.push(row.tipologia_test);
        }
      });
    }
    
    // Ordina alfabeticamente
    options.sort();
    
    // Popola il dropdown
    const testsDropdown = document.getElementById("testsDropdown");
    testsDropdown.innerHTML = "";
    
    if (options.length === 0) {
        testsDropdown.innerHTML = '<option disabled>Nessun test disponibile</option>';
    } else {
        options.forEach(opt => {
          const optionEl = document.createElement("option");
          optionEl.value = opt;
          optionEl.textContent = opt;
          testsDropdown.appendChild(optionEl);
        });
    }
}

// Event listeners
document.getElementById("refreshTutors").addEventListener("click", loadTutors);
document.addEventListener("DOMContentLoaded", () => {
    loadTutors();
    loadTestOptions();
});