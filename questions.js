const gameData = {
    // Предложения из фото учебника + фантазия по теме
    questions: [
        {q: "Güneş doğudan ____.", a: ["doğar", "batmaz", "yağar"], ok: 0},
        {q: "Su yüz derecede ____.", a: ["akar", "kaynar", "döner"], ok: 1},
        {q: "İstanbul'a kar ____ mı?", a: ["eser", "yağar", "yaşar"], ok: 1},
        {q: "Bulutlar çarpışınca ____ çakar.", a: ["gökkuşağı", "şimşek", "kar"], ok: 1},
        {q: "Newton, yer çekimini bir ____ sayesinde buldu.", a: ["elma", "armut", "kar"], ok: 0},
        {q: "Deprem yeryüzündeki ____ meydana gelir.", a: ["kırıklardan", "sulardan", "bulutlardan"], ok: 0},
        {q: "Çok yağmur yağınca ____ olur.", a: ["kuraklık", "sel", "çığ"], ok: 1},
        {q: "Kışın dağlarda ____ düşebilir.", a: ["sel", "çığ", "yıldırım"], ok: 1}
    ],
    
    lastIndex: -1,

    getRandomQuestion() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.questions.length);
        } while (newIndex === this.lastIndex);
        
        this.lastIndex = newIndex;
        return this.questions[newIndex];
    }
};
