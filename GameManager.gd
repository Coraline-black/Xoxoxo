extends Node

# Список вопросов прямо из твоего фото (Unit 5)
var quiz_data = [
	{"q": "Güneş doğudan ____.", "options": ["doğar", "batmaz", "yağar"], "correct": "doğar"},
	{"q": "İstanbul'a kar ____ mı?", "options": ["yaşar", "yağar", "akar"], "correct": "yağar"},
	{"q": "Su yüz derecede ____.", "options": ["akar", "kaynar", "döner"], "correct": "kaynar"},
	{"q": "Newton ____ buldu.", "options": ["yer çekimini", "depremi", "çığ"], "correct": "yer çekimini"},
	{"q": "Çok yağmur yağınca ____ olur.", "options": ["kuraklık", "sel", "yıldırım"], "correct": "sel"}
]

var current_q = 0

func _ready():
	start_round()

func start_round():
	var data = quiz_data[current_q]
	# Посылаем текст вопроса на экран
	get_tree().call_group("UI", "update_question", data["q"])
	# Раздаем слова снеговикам
	get_tree().call_group("Snowmen", "assign_words", data["options"], data["correct"])

func check_answer(is_right):
	if is_right:
		print("Красота! Правильно!")
		current_q = (current_q + 1) % quiz_data.size()
		start_round()
	else:
		print("Мимо! Снеговик смеется над тобой.")
