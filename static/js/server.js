function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
            rate: params.get('rate'),
            name: params.get('name'),
            test_name: params.get('test_name'),
            class: params.get('class'),
            total_tasks: params.get('total_tasks'),
            correct_tasks: params.get('correct_tasks'),
            time: params.get('time'),
            points: params.get('points'),
            efficiency: params.get('efficiency')
        };
}
const params = getQueryParams();
document.getElementById('rate').textContent = params.rate || 'не выбрано';
document.getElementById('name').textContent = params.name || 'не указано';
document.getElementById('test_name').textContent = params.test_name || 'не указано';
document.getElementById('class').textContent = params.class || 'не указано';
document.getElementById('total_tasks').textContent = params.total_tasks || 'не указано';
document.getElementById('correct_tasks').textContent = params.correct_tasks || 'не указано';
document.getElementById('time').textContent = params.time || 'не указано';
document.getElementById('points').textContent = params.points || 'не указано';
document.getElementById('efficiency').textContent = params.efficiency || 'не указано';
