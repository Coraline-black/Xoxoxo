const SnowAI = {
    subjects: ["Rüzgar", "Şimşek", "Hava", "Doğa"],
    adjectives: ["sert", "korkunç", "harika", "temiz"],

    // ИИ генерирует предложение сам
    generateQuestion() {
        const s = this.subjects[Math.floor(Math.random()*this.subjects.length)];
        const a = this.adjectives[Math.floor(Math.random()*this.adjectives.length)];
        return {
            q: `Bugün ${s} çok ____.`,
            a: [a, "mavi", "yavaş"],
            ok: 0
        };
    },

    // ИИ делает игру сложнее
    getDifficulty(score) {
        return score > 50 ? 2.0 : 1.0;
    }
};
