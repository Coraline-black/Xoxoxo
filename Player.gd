extends CharacterBody3D

@export var snowball_node: PackedScene # Сюда перетащишь модельку снежка
@onready var hand = $Camera3D/HandVisual # Твои мультяшные руки

func _input(event):
	# Если нажали мышку — кидаем!
	if event is InputEventMouseButton and event.pressed:
		throw_snowball()

func throw_snowball():
	var ball = snowball_node.instantiate()
	get_tree().root.add_child(ball)
	# Позиция броска — от рук
	ball.global_position = hand.global_position
	# Лети, снежок! (Сила броска вперед)
	var dir = -get_viewport().get_camera_3d().global_transform.basis.z
	ball.apply_central_impulse(dir * 20.0)

func _process(delta):
	# Эффект покачивания рук как в крутых играх
	hand.position.y = -0.5 + sin(Time.get_ticks_msec() * 0.003) * 0.03
