extends StaticBody3D

@onready var word_label = $Label3D # Текст над головой
var is_correct = false

func assign_words(options, correct_word):
	# Снеговик выбирает одно слово из трех
	var my_word = options.pick_random() 
	word_label.text = my_word
	is_correct = (my_word == correct_word)

func hit_by_snowball():
	if is_correct:
		# Прыжок радости (Tween-анимация)
		var t = create_tween()
		t.tween_property(self, "scale", Vector3(1.5, 0.5, 1.5), 0.1)
		t.tween_property(self, "scale", Vector3(1.0, 1.0, 1.0), 0.1)
		get_node("/root/GameManager").check_answer(true)
	else:
		# Тряска головой
		var t = create_tween()
		t.tween_property(self, "rotation:z", 0.2, 0.05)
		t.tween_property(self, "rotation:z", -0.2, 0.05)
		t.tween_property(self, "rotation:z", 0, 0.05)
