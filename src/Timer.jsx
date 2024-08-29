import { useState, useRef, useEffect } from 'react';

const Timer = () => {
	const [time, setTime] = useState(0); // Timer state
	const [isRunning, setIsRunning] = useState(false);
	const [log, setLog] = useState([]);
	const [totalTime, setTotalTime] = useState(0);
	const [inputValue, setInputValue] = useState('');
	const [totalInputValue, setTotalInputValue] = useState(0);
	const [isEditingTime, setIsEditingTime] = useState(false); // State to toggle edit mode
	const intervalRef = useRef(null);

	// Effect to initialize log from localStorage
	useEffect(() => {
		console.log('Retrieving log from localStorage...');
		try {
			const savedLog = JSON.parse(localStorage.getItem('timerLog')) || [];
			console.log('Retrieved log:', savedLog);
			setLog(savedLog);

			const savedTotalTime = savedLog.reduce((acc, entry) => acc + entry.time, 0);
			const savedTotalInputValue = savedLog.reduce((acc, entry) => acc + entry.input, 0);
			setTotalTime(savedTotalTime);
			setTotalInputValue(savedTotalInputValue);
		} catch (error) {
			console.error('Error parsing localStorage data:', error);
		}
	}, []);

	// Effect to save log to localStorage whenever log changes
	useEffect(() => {
		console.log('Saving log to localStorage...', log);

		if (log.length === 0) {
			console.warn('log is empty, preventing unintended save.');
			return;
		}

		localStorage.setItem('timerLog', JSON.stringify(log));
	}, [log]);

	const startTimer = () => {
		if (!isRunning) {
			setIsRunning(true);
			intervalRef.current = setInterval(() => {
				setTime((prevTime) => prevTime + 1);
			}, 1000);
		}
	};

	const stopTimer = () => {
		if (isRunning) {
			clearInterval(intervalRef.current);
			setIsRunning(false);
		}
	};

	const restartTimer = () => {
		clearInterval(intervalRef.current);
		setTime(0);
		setIsRunning(false);
		startTimer();
	};

	const logTime = () => {
		const inputNumber = parseInt(inputValue) || 0;
		const newTime = time;

		const newLog = [...log, { time: newTime, input: inputNumber }];
		console.log('Adding new log entry:', { time: newTime, input: inputNumber });
		setLog(newLog);
		setTotalTime((prevTotal) => prevTotal + newTime);
		setTotalInputValue((prevTotalInput) => prevTotalInput + inputNumber);
	};

	const clearLog = () => {
		console.log('Clear log called');
		setLog([]);
		setTotalTime(0);
		setTotalInputValue(0);
		localStorage.removeItem('timerLog');
	};

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	};

	const handleTimeChange = (e) => {
		const timeParts = e.target.value.split(':').map((part) => parseInt(part, 10) || 0);
		const newTimeInSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
		setTime(newTimeInSeconds);
		setIsEditingTime(false);
	};

	const formatTime = (totalSeconds) => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	return (
		<div className="p-4">
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold mb-4">Timer</h1>
				{isEditingTime ? (
					<input
						type="text"
						className="text-xl text-center"
						defaultValue={formatTime(time)}
						onBlur={handleTimeChange}
						autoFocus
					/>
				) : (
					<span
						className="text-xl cursor-pointer"
						onClick={() => setIsEditingTime(true)}
					>
						{formatTime(time)}
					</span>
				)}
			</div>

			<div className="mb-4">
				<div className="mt-2 flex justify-center gap-2.5">
					<button
						onClick={startTimer}
						className="bg-green-500 w-1/4 h-12 text-white px-4 py-2 rounded"
					>
						Старт
					</button>
					<button
						onClick={stopTimer}
						className="bg-red-500 w-1/4 h-12 text-white px-4 py-2 rounded"
					>
						Стоп
					</button>
					<button
						onClick={restartTimer}
						className="bg-yellow-500 w-1/4 h-12 text-white px-4 py-2 rounded"
					>
						Рестарт
					</button>
				</div>
			</div>
			<div className="mt-2 flex justify-center gap-2.5">
				<button
					onClick={logTime}
					className="bg-blue-500 w-5/12 h-12 text-white px-4 py-2 rounded mb-4"
				>
					Записати час
				</button>
				<button
					onClick={clearLog}
					className="bg-gray-500 w-5/12 h-12 text-white px-4 py-2 rounded"
				>
					Очистити журнал
				</button>
			</div>
			<input
				type="number"
				value={inputValue}
				onChange={handleInputChange}
				className="border p-2 rounded w-full bg-slate-900"
				placeholder="Введіть число"
			/>
			<h2 className="text-xl mb-2">Журнал:</h2>
			<ul className="list-disc pl-5 mb-4">
				{log.map((entry, index) => (
					<li key={index}>
						{formatTime(entry.time)} (Число з інпуту: {entry.input})
					</li>
				))}
			</ul>
			<h3 className="text-lg mb-2">
				Загальний час: {formatTime(totalTime)} (Загальна сума чисел з інпуту: {totalInputValue})
			</h3>
		</div>
	);
};

export default Timer;
