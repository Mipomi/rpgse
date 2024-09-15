document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginScreen = document.getElementById('login-screen');
    const gameScreen = document.getElementById('game-screen');
    const playerNameSpan = document.getElementById('player-name');
    const fightButton = document.getElementById('fight-monster');
    const viewStatusButton = document.getElementById('view-status');
    const gameMessage = document.getElementById('game-message');
    const playerStatus = document.getElementById('player-status');
    const statusInfo = document.getElementById('status-info');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        try {
            const response = await fetch('/data/akun.json');
            if (!response.ok) throw new Error('Gagal memuat data akun');
            const data = await response.json();
            
            if (!data[username]) {
                // Daftarkan akun baru
                data[username] = {
                    level: 1,
                    experience: 0,
                    health: 100,
                    attack: 10,
                    defense: 5
                };
                await fetch('/data/akun.json', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }
            playerNameSpan.textContent = username;
            loginScreen.style.display = 'none';
            gameScreen.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            gameMessage.textContent = 'Terjadi kesalahan saat memuat data akun.';
        }
    });

    fightButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/data/monster.json');
            if (!response.ok) throw new Error('Gagal memuat data monster');
            const monsters = await response.json();
            const monster = monsters[Math.floor(Math.random() * monsters.length)];
            const player = document.getElementById('username').value;
            const playerResponse = await fetch('/data/akun.json');
            if (!playerResponse.ok) throw new Error('Gagal memuat data pemain');
            const playerData = await playerResponse.json();

            // Monster menyerang pemain
            const monsterDamage = Math.max(monster.attack - playerData[player].defense, 0); // Kurangi damage dengan defense pemain
            playerData[player].health -= monsterDamage;

            if (playerData[player].health <= 0) {
                playerData[player].health = 100; // Kembalikan kesehatan pemain ke nilai semula
                // Kurangi pengalaman pemain sebanyak 30%
                playerData[player].experience *= 0.7;

                // Hitung batas pengalaman minimal untuk level saat ini
                const minExperienceForLevel = playerData[player].level * 100;

                // Turunkan level jika pengalaman kurang dari batas minimal
                while (playerData[player].experience < minExperienceForLevel && playerData[player].level > 1) {
                    playerData[player].level -= 1;
                    playerData[player].experience = Math.max(playerData[player].experience, (playerData[player].level - 1) * 100);
                }

                await fetch('/data/akun.json', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(playerData)
                });

                gameMessage.textContent = `Kamu kalah melawan ${monster.name} dan kehilangan 30% pengalaman! Kesehatan kamu kembali ke ${playerData[player].health}. Level kamu sekarang ${playerData[player].level}.`;
                return;
            }

            // Update pengalaman dan level pemain
            playerData[player].experience += monster.experience;
            if (playerData[player].experience >= playerData[player].level * 100) {
                playerData[player].experience -= playerData[player].level * 100;
                playerData[player].level += 1;

                // Tingkatkan atribut pemain
                playerData[player].attack += 5; // Naikkan attack
                playerData[player].health += 20; // Naikkan health
                playerData[player].defense += 3; // Naikkan defense

                gameMessage.textContent = `Selamat! Kamu naik level ke level ${playerData[player].level}! Statistik kamu meningkat.`;
            }

            // Simpan data pemain yang diperbarui
            await fetch('/data/akun.json', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playerData)
            });

            // Hitung sisa EXP yang dibutuhkan untuk level berikutnya
            const expForNextLevel = playerData[player].level * 100;
            const expNeededForNextLevel = expForNextLevel - playerData[player].experience;

            gameMessage.textContent = `Kamu melawan ${monster.name} dan mendapatkan ${monster.experience} pengalaman! Kamu menerima ${monsterDamage} damage. Level kamu sekarang ${playerData[player].level}. Kesehatan: ${playerData[player].health}.`;
        } catch (error) {
            console.error('Error:', error);
            gameMessage.textContent = 'Terjadi kesalahan saat pertarungan.';
        }
    });

    viewStatusButton.addEventListener('click', async () => {
        try {
            const player = document.getElementById('username').value;
            const playerResponse = await fetch('/data/akun.json');
            if (!playerResponse.ok) throw new Error('Gagal memuat status pemain');
            const playerData = await playerResponse.json();
            const status = playerData[player];

            // Hitung sisa EXP yang dibutuhkan untuk level berikutnya
            const expForNextLevel = status.level * 100;
            const expNeededForNextLevel = expForNextLevel - status.experience;

            statusInfo.textContent = `Level: ${status.level}
            Pengalaman: ${status.experience}/${expNeededForNextLevel}
            Kesehatan: ${status.health}
            Serangan: ${status.attack}
            Pertahanan: ${status.defense}.`;
            playerStatus.style.display = 'block';
        } catch (error) {
            console.error('Error:', error);
            statusInfo.textContent = 'Terjadi kesalahan saat memuat status pemain.';
        }
    });
});
