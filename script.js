const SUPABASE_URL = "https://gohgjzbthauwryjzwnex.supabase.co"; // Fixed URL (removed /rest/v1/)
const SUPABASE_ANON_KEY = "sb_publishable_iVhI5pv2bJo1S3V_6biMtA_vmjjoN8M"; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function generateSecretKey(id, name) {
    return id.trim().toLowerCase() + "_" + name.trim().replace(/\s+/g, '').toLowerCase();
}

document.getElementById('capsuleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const student_id = document.getElementById('studentId').value.trim();
    const student_name = document.getElementById('studentName').value.trim();
    const student_email = document.getElementById('studentEmail').value.trim();
    const capsule_text = document.getElementById('capsuleText').value.trim();
    
    // Constant Release Date: May 29, 2027 (Format: YYYY-MM-DD)
    const unlock_date = "2027-05-29";

    const secretKey = generateSecretKey(student_id, student_name);
    
    // Encrypting the letter with their unique key
    const encryptedText = CryptoJS.AES.encrypt(capsule_text, secretKey).toString();

    const { data, error } = await supabaseClient
        .from('time_capsules')
        .insert([{ 
            student_id, 
            student_name, 
            student_email,
            capsule_text: encryptedText,
            unlock_date 
        }]);

    if (error) {
        alert('Error sealing capsule: ' + error.message);
    } else {
        alert('🎉 Your legacy memory capsule is sealed! Your future self will receive your letter on May 29, 2027.');
        document.getElementById('capsuleForm').reset();
    }
});

// Front page intro envelope opening logic
let currentEnvelopeStage = 1;
document.getElementById('envelopeSeal').addEventListener('click', function() {
    const flap = document.getElementById('envelopeFlap');
    const letter = document.getElementById('envelopeLetter');
    const frontText = document.getElementById('envelopeFrontText');
    const sealIcon = document.getElementById('sealIcon');
    const envelopeStage = document.getElementById('envelopeStage');
    const mainWebsiteStage = document.getElementById('mainWebsiteStage');

    if (currentEnvelopeStage === 1) {
        flap.classList.add('open');
        frontText.classList.add('opacity-0', 'pointer-events-none');
        this.style.top = '220px';
        sealIcon.className = 'fa-solid fa-heart-circle-check text-xl';

        setTimeout(() => {
            letter.classList.remove('opacity-0', 'pointer-events-none');
            letter.classList.add('opacity-100');
            letter.style.transform = 'translateY(-110px) scale(1)';
        }, 300);

        currentEnvelopeStage = 2;
    } else if (currentEnvelopeStage === 2) {
        envelopeStage.classList.add('opacity-0', 'pointer-events-none');
        
        setTimeout(() => {
            envelopeStage.classList.add('hidden');
            mainWebsiteStage.classList.remove('opacity-0', 'pointer-events-none');
            mainWebsiteStage.classList.add('opacity-100');
        }, 600);
    }
});