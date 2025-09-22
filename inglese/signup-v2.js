const supabase = window.supabase;

document.addEventListener("DOMContentLoaded", async () => {
    // Check initial auth status when page loads
    const { data: initialSession } = await supabase.auth.getSession();
    console.log("🚀 Page loaded - Current auth status:", {
        isLoggedIn: !!initialSession?.session,
        userEmail: initialSession?.session?.user?.email,
        userId: initialSession?.session?.user?.id,
        role: initialSession?.session?.user?.role
    });

    const signupBtn = document.getElementById("signupBtn");

    if (!signupBtn) {
      console.error("❌ ERROR: Signup button not found.");
      return;
    }

    signupBtn.addEventListener("click", async () => {
      // Check auth status right before signup
      const { data: preClickSession } = await supabase.auth.getSession();
      console.log("🎯 Button clicked - Auth status before signup:", {
          isLoggedIn: !!preClickSession?.session,
          userEmail: preClickSession?.session?.user?.email,
          userId: preClickSession?.session?.user?.id
      });

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
        showError("Per favore compila tutti i campi e seleziona almeno un test.");
        return;
      }

      if (password !== confirmPassword) {
        showError("Le password non coincidono.");
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

        // Save the current tutor session
        const { data: tutorSession } = await supabase.auth.getSession();
        const tutorAccessToken = tutorSession?.session?.access_token;
        const tutorRefreshToken = tutorSession?.session?.refresh_token;

        console.log("🔍 Current session before signup:", {
            hasSession: !!tutorSession?.session,
            userEmail: tutorSession?.session?.user?.email,
            userId: tutorSession?.session?.user?.id,
            hasAccessToken: !!tutorAccessToken,
            hasRefreshToken: !!tutorRefreshToken
        });

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
                showError("Questo indirizzo email è già registrato nel sistema.");
            } else {
                showError("Errore durante la registrazione: " + error.message);
            }
            return;
        }

        const user = data.user;
        console.log("✅ Utente creato! Auth UID:", user.id);

        // Check current session after signup
        const { data: currentSessionAfterSignup } = await supabase.auth.getSession();
        console.log("🔍 Session after signup:", {
            hasSession: !!currentSessionAfterSignup?.session,
            userEmail: currentSessionAfterSignup?.session?.user?.email,
            userId: currentSessionAfterSignup?.session?.user?.id
        });

        // Restore tutor session before database operations
        if (tutorAccessToken && tutorRefreshToken) {
            console.log("🔄 Restoring tutor session...");
            await supabase.auth.setSession({
                access_token: tutorAccessToken,
                refresh_token: tutorRefreshToken
            });

            // Verify the session was restored
            const { data: restoredSession } = await supabase.auth.getSession();
            console.log("✅ Tutor session restored:", {
                hasSession: !!restoredSession?.session,
                userEmail: restoredSession?.session?.user?.email,
                userId: restoredSession?.session?.user?.id
            });
        } else {
            console.warn("⚠️ No tutor session to restore - user might not be logged in as tutor");
        }

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
            showError("Errore nel salvataggio delle informazioni. L'account è stato creato ma contatta il supporto.");
            return;
        }

        // Inizializza i test per lo studente
        try {
            await initializeStudentTests(user.id, chosenTests);
        } catch (testError) {
            console.error("❌ Errore inizializzazione test:", testError);
            // Non bloccare il processo se l'inizializzazione test fallisce
        }
        
        // Success!
        showSuccess(`✅ Student registered successfully!\n\nThe student can now log in with:\nEmail: ${email}\nPassword: the one just set`);

        // Clear the form
        clearForm();
        
        // Redirect to tutor dashboard after 2 seconds
        setTimeout(() => {
            window.location.href = "tutor_dashboard.html";
        }, 2000);

    } catch (err) {
        console.error("❌ Errore imprevisto:", err);
        showError("Si è verificato un errore imprevisto. Riprova.");
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
      showError("Errore nel caricamento dei tutor.");
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