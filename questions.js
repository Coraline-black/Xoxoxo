const gameData = {
    questions: [
        {q: "Güneş doğudan ____.", a: ["doğar", "batmaz", "yağar"], ok: 0},
        {q: "Su yüz derecede ____.", a: ["akar", "kaynar", "döner"], ok: 1},
        {q: "İstanbul'a kar ____ mı?", a: ["eser", "yağar", "yaşar"], ok: 1},
        {q: "Bulutlar çarpışınca ____ çakar.", a: ["gökkuşağı", "şimşek", "kar"], ok: 1},
        {q: "Newton, yer çekimini ____ buldu.", a: ["elma ile", "kitapla", "karla"], ok: 0},
        {q: "Deprem yeryüzündeki ____ meydana gelir.", a: ["kırıklardan", "sulardan", "bulutlardan"], ok: 0}
    ],
    lastIdx: -1,
    getQuestion() {
        let idx;
        do { idx = Math.floor(Math.random() * this.questions.length); } 
        while (idx === this.lastIdx);
        this.lastIdx = idx;
        return this.questions[idx];
    }
};
