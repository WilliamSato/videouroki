from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes
from urllib.parse import urlencode
import requests


user_data = {}
user_states = {}

# Состояния
CHOOSING_RATE = 0
ENTERING_NAME = 1
ENTERING_TEST = 2
ENTERING_CLASS = 3
ENTERING_TOTAL_TASKS = 4  
ENTERING_CORRECT_TASKS = 5
ENTERING_TIME = 6
ENTERING_POINTS = 7
ENTERING_EFFICIENCY = 8

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("2", callback_data='2')],
        [InlineKeyboardButton("3", callback_data='3')],
        [InlineKeyboardButton("4", callback_data='4')],
        [InlineKeyboardButton("5", callback_data='5')],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text('Выберите оценку от 2 до 5:', reply_markup=reply_markup)

    user_states[update.message.chat_id] = CHOOSING_RATE

async def handle_rate_selection(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    selected_number = query.data
    chat_id = query.message.chat_id
    user_data[chat_id] = {'rate': selected_number}
    user_states[chat_id] = ENTERING_NAME

    await query.edit_message_text(f"Вы выбрали оценку {selected_number}. Теперь введите ваше ФИ:")

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = update.message.chat_id
    message_text = update.message.text

    state = user_states.get(chat_id)

    if state == CHOOSING_RATE:
        await update.message.reply_text("Пожалуйста, сначала выберите оценку от 2 до 5.")
        return

    if state == ENTERING_NAME:
        user_data[chat_id]['name'] = message_text
        user_states[chat_id] = ENTERING_TEST
        await update.message.reply_text("Введите название теста:")

    elif state == ENTERING_TEST:
        user_data[chat_id]['test_name'] = message_text
        user_states[chat_id] = ENTERING_CLASS
        await update.message.reply_text("Введите класс (например, 2А):")

    elif state == ENTERING_CLASS:
        user_data[chat_id]['class'] = message_text
        user_states[chat_id] = ENTERING_TOTAL_TASKS
        await update.message.reply_text("Введите общее количество заданий:")

    elif state == ENTERING_TOTAL_TASKS:
        user_data[chat_id]['total_tasks'] = message_text
        user_states[chat_id] = ENTERING_CORRECT_TASKS
        await update.message.reply_text("Введите количество верно выполненных заданий:")

    elif state == ENTERING_CORRECT_TASKS:
        user_data[chat_id]['correct_tasks'] = message_text
        user_states[chat_id] = ENTERING_TIME
        await update.message.reply_text("Введите время на прохождение теста (в минутах):")

    elif state == ENTERING_TIME:
        user_data[chat_id]['time'] = message_text
        user_states[chat_id] = ENTERING_POINTS
        await update.message.reply_text("Введите количество набранных баллов (из 40):")

    elif state == ENTERING_POINTS:
        user_data[chat_id]['points'] = message_text
        user_states[chat_id] = ENTERING_EFFICIENCY
        await update.message.reply_text("Введите результативность в процентах:")

    elif state == ENTERING_EFFICIENCY:
        user_data[chat_id]['efficiency'] = message_text


        rate = int(user_data[chat_id].get('rate', 5))  
        total_tasks = int(user_data[chat_id].get('total_tasks', 0))
        correct_tasks = int(user_data[chat_id].get('correct_tasks', 0))
        points = int(user_data[chat_id].get('points', 0))
        efficiency = float(user_data[chat_id].get('efficiency', 100))

        if rate == 3:
            coefficient = 0.8  
        elif rate == 4:
            coefficient = 0.9  
        else:
            coefficient = 1.0 

        adjusted_correct_tasks = int(correct_tasks * coefficient)
        adjusted_points = int(points * coefficient)
        adjusted_efficiency = efficiency * coefficient

        user_data[chat_id]['adjusted_correct_tasks'] = adjusted_correct_tasks
        user_data[chat_id]['adjusted_points'] = adjusted_points
        user_data[chat_id]['adjusted_efficiency'] = adjusted_efficiency

        name = user_data[chat_id].get('name', 'не указано')
        test_name = user_data[chat_id].get('test_name', 'не указано')
        class_name = user_data[chat_id].get('class', 'не указано')
        time = user_data[chat_id].get('time', 'не указано')

        data = {
            'rate': rate,
            'name': name,
            'test_name': test_name,
            'class': class_name,
            'total_tasks': total_tasks,
            'correct_tasks': correct_tasks,
            'time': time,
            'points': points,
            'efficiency': efficiency
        }

        response = requests.post('http://videouroki.site/', json=data)

        if response.status_code == 200:
            await update.message.reply_text(f"Ваши данные отправлены на сервер. Ответ сервера: {response.json()}")
        else:
            await update.message.reply_text(f"Произошла ошибка при отправке данных на сервер. Код ошибки: {response.status_code}")


        base_url = "http://videouroki.site/"
        params = {
            'rate': rate,
            'name': name,
            'test_name': test_name,
            'class': class_name,
            'total_tasks': total_tasks,
            'correct_tasks': adjusted_correct_tasks,
            'time': time,
            'points': adjusted_points,
            'efficiency': adjusted_efficiency
        }
        url_with_params = f"{base_url}?{urlencode(params)}"

        await update.message.reply_text(
            f"Ваши данные:\nФИ: {name}\nОценка: {rate}\nТест: {test_name}\nКласс: {class_name}\n"
            f"Всего заданий: {total_tasks}\nВерных заданий: {adjusted_correct_tasks}\nВремя: {time} минут.\n"
            f"Баллов: {adjusted_points} из 40\nРезультативность: {adjusted_efficiency:.2f}%\n"
            f"Ваша персонализированная ссылка: {url_with_params}"
        )

        # Завершаем диалог
        user_data.pop(chat_id, None)
        user_states.pop(chat_id, None)

def main():
    application = Application.builder().token("-----------------------").build()
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CallbackQueryHandler(handle_rate_selection))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))

    application.run_polling()
if __name__ == '__main__':
    main()
