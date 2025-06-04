// Aggiungi questo all'inizio del file, dopo gli import
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://elrwpaezjnemmiegkyin.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVscndwYWV6am5lbW1pZWdreWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzAyMDUsImV4cCI6MjA1MzY0NjIwNX0.p6R2S1HK8kPFYiEAYtYaxIAH8XSmzjQBWQ_ywy3akdI";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Variabile globale per la subscription
let realtimeSubscription = null;

// Modifica la funzione DOMContentLoaded per includere la subscription
document.addEventListener("DOMContentLoaded", async () => {
    await loadTestTree();
    setupRealtimeSubscription(); // Aggiungi questa linea
});

// Nuova funzione per configurare la subscription real-time
async function setupRealtimeSubscription() {
    // Ottieni l'utente corrente
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData || !sessionData.session) {
        console.error("❌ No active session for realtime:", sessionError?.message);
        return;
    }

    const userId = sessionData.session.user.id;
    const selectedTest = sessionStorage.getItem("selectedTestType");
    
    if (!selectedTest) {
        console.error("❌ No test selected for realtime subscription");
        return;
    }

    console.log("🔄 Setting up realtime subscription for user:", userId);

    // Crea la subscription per ascoltare i cambiamenti
    realtimeSubscription = supabase
        .channel('student-tests-changes')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'student_tests',
                filter: `auth_uid=eq.${userId}`
            },
            async (payload) => {
                console.log('📡 Realtime update received:', payload);
                
                // Se un test è stato completato, esegui l'auto-unlock
                if (payload.new.status === 'completed') {
                    console.log('✅ Test completed, checking for auto-unlock...');
                    await handleAutoUnlock(payload.new);
                }
            }
        )
        .subscribe((status) => {
            console.log('📡 Realtime subscription status:', status);
        });
}

// Nuova funzione per gestire l'auto-unlock quando un test viene completato
async function handleAutoUnlock(completedTest) {
    const selectedTest = sessionStorage.getItem("selectedTestType");
    const userId = completedTest.auth_uid;

    // Recupera tutti i test dello studente
    let { data: allTests, error } = await supabase
        .from("student_tests")
        .select("*")
        .eq("auth_uid", userId)
        .eq("tipologia_test", selectedTest)
        .order("unlock_order");

    if (error) {
        console.error("❌ Error fetching tests for auto-unlock:", error.message);
        return;
    }

    console.log(`🔍 Checking auto-unlock for completed test order ${completedTest.unlock_order}`);

    // Trova il prossimo test automatico da sbloccare
    const nextTest = allTests.find(test => 
        test.unlock_mode === "automatic" &&
        test.unlock_order === completedTest.unlock_order + 1 &&
        test.status === "locked"
    );

    if (nextTest) {
        console.log(`🔓 Auto-unlocking next test: ${nextTest.section} - ${nextTest.tipologia_esercizi} ${nextTest.progressivo}`);
        
        // Sblocca il test successivo
        const { error: updateError } = await supabase
            .from("student_tests")
            .update({ status: "unlocked" })
            .eq("id", nextTest.id);

        if (!updateError) {
            console.log("✅ Test auto-unlocked successfully!");
            // Ricarica l'albero dei test per mostrare il cambiamento
            await loadTestTree();
        } else {
            console.error("❌ Error auto-unlocking test:", updateError.message);
        }
    } else {
        console.log("ℹ️ No next automatic test to unlock");
    }
}

// Aggiungi cleanup quando l'utente lascia la pagina
window.addEventListener("beforeunload", () => {
    if (realtimeSubscription) {
        console.log("🔌 Unsubscribing from realtime...");
        realtimeSubscription.unsubscribe();
    }
});

// Modifica la funzione loadTestTree esistente per rimuovere il vecchio codice auto-unlock
async function loadTestTree() {
    const selectedTest = sessionStorage.getItem("selectedTestType");

    if (!selectedTest) {
        alert("No test selected. Redirecting to test selection...");
        window.location.href = "choose_test.html";
        return;
    }

    console.log(`🎯 Selected Test: ${selectedTest}`);

    // Determine test type based on "PDF"
    const testType = selectedTest.includes("PDF") ? "pdf" : "banca_dati";
    console.log(`📌 Determined Test Type: ${testType}`);

    // Get active session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData || !sessionData.session) {
        console.error("❌ No active session:", sessionError?.message);
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    const user = sessionData.session.user;
    console.log("👤 Logged-in User ID:", user.id);

    // ✅ Fetch the student's section order from `ordine_sections`
    const { data: studentTestOrder, error: studentTestOrderError } = await supabase
        .from("ordine_sections")
        .select("ordine")
        .eq("auth_uid", user.id)
        .eq("tipologia_test", selectedTest);

    if (studentTestOrderError || !studentTestOrder || studentTestOrder.length === 0) {
        console.error("❌ Error fetching student's section order:", studentTestOrderError?.message);
        window.location.href = "choose_test.html";
        alert("Section order not found. Please contact support.");
        return;
    }

    // ✅ Ensure `ordineSections` contains only unique values
    let ordineSections = [...new Set(studentTestOrder[0].ordine)];
    console.log("📊 Section Order (Unique):", ordineSections);

    if (!ordineSections || ordineSections.length === 0) {
        console.error("❌ ordine_sections is empty or missing.");
        alert("No section order available. Please contact support.");
        window.location.href = "choose_test.html";
        return;
    }

    // ✅ Fetch student's test progress
    let { data: studentTests, error: progressError } = await supabase
        .from("student_tests")
        .select("*")
        .eq("auth_uid", user.id)
        .eq("tipologia_test", selectedTest)
        .order("tipologia_esercizi, progressivo");

    if (progressError) {
        console.error("❌ Error fetching student progress:", progressError.message);
        window.location.href = "choose_test.html";
        return;
    }

    console.log("📊 Student Progress Data:", studentTests);
    console.log("📊 Selected Test Type:", selectedTest);
    
    // RIMOSSO IL VECCHIO CODICE AUTO-UNLOCK DA QUI
    // L'auto-unlock ora viene gestito dalla subscription real-time
    
    // ✅ Ensure only unique sections exist in test data
    studentTests = studentTests.filter((test, index, self) =>
        index === self.findIndex((t) =>
             t.section === test.section &&
             t.tipologia_esercizi === test.tipologia_esercizi &&
             t.progressivo === test.progressivo
        )
    );

    // ✅ Sort test data based on `ordine_sections`
    studentTests.sort((a, b) => ordineSections.indexOf(a.section) - ordineSections.indexOf(b.section));
    
    // 1️⃣ Fetch Materia for each question
    const { data: questionsData, error: materiaError } = await supabase
    .from("questions")
    .select("section, tipologia_esercizi, progressivo, Materia")
    .eq("tipologia_test", selectedTest);

    if (materiaError) {
        console.error("❌ Error fetching Materia info:", materiaError.message);
    }

    // 2️⃣ Build a quick lookup: "section|tipologia|progressivo" → Materia
    const materiaMap = {};
    questionsData.forEach(q => {
        materiaMap[`${q.section}|${q.tipologia_esercizi}|${q.progressivo}`] = q.Materia;
    });

    // 3️⃣ Attach `Materia` to each studentTests record
    studentTests = studentTests.map(t => ({
        ...t,
        Materia: materiaMap[`${t.section}|${t.tipologia_esercizi}|${t.progressivo}`] || ""
    }));

    // Finally call your renderer with the enriched array
    displayTestTree(studentTests, studentTests, testType, selectedTest);
}