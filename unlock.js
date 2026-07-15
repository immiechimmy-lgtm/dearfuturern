const SUPABASE_URL = "https://gohgjzbthauwryjzwnex.supabase.co"; //supabase input URL - lagayan
const SUPABASE_ANON_KEY = "sb_publishable_iVhI5pv2bJo1S3V_6biMtA_vmjjoN8M"; //supabase input ANON KEY - lagayan

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function generateSecretKey(id, name) {
    return id.trim().toLowerCase() + "_" + name.trim().replace(/\s+/g, '').toLowerCase();
}

document.getElementById('retrieveBtn').addEventListener('click', async () => {
    const searchId = document.getElementById('searchId').value.trim();
    const searchName = document.getElementById('searchName').value.trim();
    const statusMessage = document.getElementById('statusMessage');
    
    if (!searchId || !searchName) {
        statusMessage.className = "p-4 rounded-xl border bg-red-50 border-red-200 text-red-700 block";
        statusMessage.innerHTML = "Please enter both your Student ID and Full Name.";
        return;
    }

    // Hide previous messages and show loading feedback
    statusMessage.className = "p-4 rounded-xl border bg-slate-50 border-slate-200 text-slate-600 block animate-pulse";
    statusMessage.innerHTML = "<i class='fa-solid fa-spinner animate-spin mr-2'></i> Searching memory archives...";

    const { data, error } = await supabaseClient
        .from('time_capsules')
        .select('*')
        .eq('student_id', searchId)
        .order('created_at', { ascending: false });

    if (error) {
        statusMessage.className = "p-4 rounded-xl border bg-red-50 border-red-200 text-red-700 block";
        statusMessage.innerHTML = "Error database retrieval. Please try again.";
        return;
    }
    
    if (!data || data.length === 0) {
        statusMessage.className = "p-4 rounded-xl border bg-red-50 border-red-200 text-red-700 block";
        statusMessage.innerHTML = "❌ No time capsule found with this Student ID.";
        return;
    }

    const capsule = data[0];
    const today = new Date().toISOString().split('T')[0];

    // Case 1: capsule is ready to open
    if (today >= capsule.unlock_date) {
        try {
            const secretKey = generateSecretKey(searchId, searchName);
            const bytes = CryptoJS.AES.decrypt(capsule.capsule_text, secretKey);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);

            if (!originalText) {
                throw new Error("Wrong credentials supplied");
            }

            // Populate Envelope Data
            document.getElementById('recipientLabel').textContent = `Future RN ${capsule.student_name}`;
            document.getElementById('decryptedLetterBody').textContent = `"${originalText}"`;
            document.getElementById('letterAuthor').textContent = `— ${capsule.student_name}`;
            document.getElementById('letterDate').textContent = `Sealed on: ${new Date(capsule.created_at).toLocaleDateString()}`;

            // Transition To Envelope Stage
            const searchStage = document.getElementById('searchStage');
            const envelopeStage = document.getElementById('envelopeStage');
            
            searchStage.classList.add('opacity-0', 'scale-95');
            setTimeout(() => {
                searchStage.classList.add('hidden');
                envelopeStage.classList.remove('hidden');
                envelopeStage.classList.add('flex');
                setTimeout(() => {
                    envelopeStage.classList.add('opacity-100');
                }, 50);
            }, 500);

        } catch (err) {
            statusMessage.className = "p-4 rounded-xl border bg-red-50 border-red-200 text-red-700 block";
            statusMessage.innerHTML = "❌ Decryption failed. Please make sure the Full Name matches what was written originally.";
        }
    } 
    // Case 2: Capsule is still locked
    else {
        statusMessage.className = "p-4 rounded-xl border bg-yellow-50 border-yellow-200 text-yellow-800 block";
        statusMessage.innerHTML = `
            <p class="font-bold">🔒 Still Locked & Strongly Encrypted!</p>
            <p class="text-xs mt-1">Hello ${capsule.student_name}, this capsule is scheduled to open on <span class="font-bold underline">${new Date(capsule.unlock_date).toLocaleDateString()}</span>.</p>
            <p class="text-[10px] text-gray-500 mt-2 font-mono break-all bg-yellow-100/50 p-2 rounded border border-yellow-200">DB Payload: ${capsule.capsule_text.substring(0, 32)}...</p>
        `;
    }
});

// Interactive envelope seal animation on unlock screen
document.getElementById('envelopeSeal').addEventListener('click', function() {
    const flap = document.getElementById('envelopeFlap');
    const letter = document.getElementById('envelopeLetter');
    const frontText = document.getElementById('envelopeFrontText');
    const sealIcon = document.getElementById('sealIcon');

    // 1. Flip open flap
    flap.classList.add('open');
    frontText.classList.add('opacity-0', 'pointer-events-none');
    
    // 2. Adjust Heart button index and styling
    this.style.top = '245px';
    this.style.transform = 'translateX(-50%) scale(0.9)';
    sealIcon.className = 'fa-solid fa-heart-circle-check text-xl';

    // 3. Slide letter out (Upward transition)
    setTimeout(() => {
        letter.classList.remove('opacity-0', 'pointer-events-none');
        letter.classList.add('opacity-100');
        
        // Push the letter up and out of the envelope cavity
        letter.style.transform = 'translateY(-190px) scale(1)';
        letter.style.zIndex = '45'; 
        letter.style.pointerEvents = 'auto';
    }, 450);
});