import React, { useState, useEffect, useRef } from 'react';

const Timer = () => {
	const [time, setTime] = useState(0);
	const [isRunning, setIsRunning] = useState(false);
	const [log, setLog] = useState([]);
	const [totalTime, setTotalTime] = useState(0);
	const [inputValue, setInputValue] = useState(30);
	const [totalInputValue, setTotalInputValue] = useState(0);
	const [isEditingTime, setIsEditingTime] = useState(false);
	const [minRandomTime, setMinRandomTime] = useState('00:01:30');
	const [maxRandomTime, setMaxRandomTime] = useState('00:02:55');
	const [tableEntries, setTableEntries] = useState([]);
	const intervalRef = useRef(null);

	useEffect(() => {
		console.log('Retrieving log and table entries from localStorage...');
		try {
			const savedLog = JSON.parse(localStorage.getItem('timerLog')) || [];
			console.log('Retrieved log:', savedLog);
			setLog(savedLog);

			const savedTotalTime = savedLog.reduce((acc, entry) => acc + entry.time, 0);
			const savedTotalInputValue = savedLog.reduce((acc, entry) => acc + entry.input, 0);
			setTotalTime(savedTotalTime);
			setTotalInputValue(savedTotalInputValue);

			const savedTableEntries = JSON.parse(localStorage.getItem('tableEntries')) || [];
			console.log('Retrieved table entries:', savedTableEntries);
			setTableEntries(savedTableEntries);
		} catch (error) {
			console.error('Error parsing localStorage data:', error);
		}
	}, []);

	useEffect(() => {
		console.log('Saving log to localStorage...', log);
		if (log.length > 0) {
			localStorage.setItem('timerLog', JSON.stringify(log));
		}
	}, [log]);

	useEffect(() => {
		console.log('Saving table entries to localStorage...', tableEntries);
		if (tableEntries.length > 0) {
			localStorage.setItem('tableEntries', JSON.stringify(tableEntries));
		}
	}, [tableEntries]);

	const startTimer = () => {
		if (!isRunning) {
			console.log('Starting timer...');
			setIsRunning(true);
			intervalRef.current = setInterval(() => {
				setTime((prevTime) => prevTime + 1);
			}, 1000);
		}
	};

	const stopTimer = () => {
		if (isRunning) {
			console.log('Stopping timer...');
			clearInterval(intervalRef.current);
			setIsRunning(false);
		}
	};

	const restartTimer = () => {
		console.log('Restarting timer...');
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

	const clearTableEntries = () => {
		console.log('Clearing table entries...');
		setTableEntries([]);
		localStorage.removeItem('tableEntries');
	};

	const handleInputChange = (e) => {
		setInputValue(e.target.value);
		console.log('Input value changed:', e.target.value);
	};

	const handleTimeChange = (e) => {
		const timeParts = e.target.value.split(':').map((part) => parseInt(part, 10) || 0);
		const newTimeInSeconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
		console.log('Time changed:', newTimeInSeconds);
		setTime(newTimeInSeconds);
		setIsEditingTime(false);
	};

	const handleRandomTime = () => {
		const minTimeParts = minRandomTime.split(':').map((part) => parseInt(part, 10) || 0);
		const maxTimeParts = maxRandomTime.split(':').map((part) => parseInt(part, 10) || 0);

		const minTimeInSeconds = minTimeParts[0] * 3600 + minTimeParts[1] * 60 + minTimeParts[2];
		const maxTimeInSeconds = maxTimeParts[0] * 3600 + maxTimeParts[1] * 60 + maxTimeParts[2];

		if (minTimeInSeconds > maxTimeInSeconds) {
			alert('Мінімальний час не може бути більшим за максимальний час.');
			return;
		}

		const randomTime = Math.floor(Math.random() * (maxTimeInSeconds - minTimeInSeconds + 1) + minTimeInSeconds);
		console.log('Generated random time:', randomTime);
		setTime(randomTime);
	};

	const formatTime = (totalSeconds) => {
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return `${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	};

	const addEntryToTable = () => {
		const currentDate = new Date().toLocaleDateString('uk-UA');
		const newEntry = {
			number: tableEntries.length + 1,
			totalTime,
			totalInputValue,
			date: currentDate,
			averageTime: calculateAverageTime(totalTime, log.length),
			editableNumber: '',
		};
		console.log('Adding entry to table:', newEntry);
		setTableEntries([...tableEntries, newEntry]);
	};

	const handleEditableNumberChange = (index, value) => {
		console.log(`Updating entry ${index} editable number to: ${value}`);
		const updatedEntries = [...tableEntries];
		updatedEntries[index].editableNumber = value;
		setTableEntries(updatedEntries);
	};

	const calculateAverageTime = (totalTime, logLength) => {
		if (logLength === 0) return 'N/A';
		const averageTime = totalTime / logLength;
		return formatTime(Math.round(averageTime));
	};

	return (
		<div className="p-4">
			<div className="flex flex-col items-center justify-center">
				<h1 className="text-2xl font-bold mb-4">Timer</h1>
				<div className="flex justify-center items-center space-x-4">
					{isEditingTime ? (
						<input
							type="text"
							className="text-xl text-center border p-2 rounded w-28"
							defaultValue={formatTime(time)}
							onBlur={handleTimeChange}
							autoFocus
						/>
					) : (
						<span
							className="text-xl cursor-pointer w-28 text-center" // Fixed width class
							onClick={() => setIsEditingTime(true)}
						>
							{formatTime(time)}
						</span>
					)}
					<span className="text-xl">|</span>
					<input
						type="number"
						value={inputValue}
						onChange={handleInputChange}
						className="text-xl text-center bg-transparent outline-none w-28 focus:bg-[rgb(18,18,18)] focus:border focus:border-gray-300 focus:rounded focus:p-1"
					/>
				</div>
				<div className="flex flex-col items-center mb-2">
					<div className="flex justify-center items-center space-x-4">
						<input
							type="text"
							value={minRandomTime}
							onChange={(e) => setMinRandomTime(e.target.value)}
							placeholder="Мін. час (гг:хх:сс)"
							className="text-xl text-center bg-transparent outline-none w-28 focus:bg-[rgb(18,18,18)] focus:border focus:border-gray-300 focus:rounded focus:p-1"
						/>
						<span className="text-xl mx-2">|</span>
						<input
							type="text"
							value={maxRandomTime}
							onChange={(e) => setMaxRandomTime(e.target.value)}
							placeholder="Макс. час (гг:хх:сс)"
							className="text-xl text-center bg-transparent outline-none w-28 focus:bg-[rgb(18,18,18)] focus:border focus:border-gray-300 focus:rounded focus:p-1"
						/>
					</div>
				</div>
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

			<div className="mt-2 flex  gap-2.5">
				<button
					onClick={logTime}
					className="bg-blue-500 w-4/12 h-12 text-white px-4 py-2 rounded mb-4"
				>
					Записати час
				</button>
				<button
					onClick={clearLog}
					className="bg-gray-500 w-4/12 h-12 text-white px-4 py-2 rounded"
				>
					Очистити лог
				</button>
				<button
					onClick={handleRandomTime}
					className="bg-purple-500 w-4/12 h-12 text-white px-4 py-2 rounded"
				>
					Згенерувати випадковий час
				</button>
			</div>


			<div>
				<h2 className="text-xl mb-2">Лог часу:</h2>
				<ul>
					{log.map((entry, index) => (
						<li className='list-decimal' key={index}>
							Час: {formatTime(entry.time)}, Кількість картинок: {entry.input}
						</li>
					))}
				</ul>
			</div>

			<div className='flex flex-col items-center justify-center gap-1.5 mt-5'>
				<h2 className="text-lg mt-4 text-center">
					Загальний час: {formatTime(totalTime)} (Загальна сума картинок: {totalInputValue})
				</h2>
				<div className='flex  gap-2.5'>
					<button
						onClick={addEntryToTable}
						className="w-44 h-12 bg-blue-500 text-white text-sm px-4 py-2 rounded mt-4"
					>
						Додати до таблиці
					</button>
					<button
						onClick={clearTableEntries}
						className="w-44 h-12 bg-red-500 text-white text-sm px-4 py-2 rounded mb-4 mt-4"
					>
						Очистити таблицю
					</button>
				</div>

			</div>

			<div className="mt-4">
				<table className="w-full border-collapse">
					<thead>
						<tr>
							<th className="border px-4 py-2">№</th>
							<th className="border px-4 py-2">Загальний час</th>
							<th className="border px-4 py-2">Загальна сума картинок</th>
							<th className="border px-4 py-2">Дата</th>
							<th className="border px-4 py-2">Середній час на один батч</th>
						</tr>
					</thead>
					<tbody>
						{tableEntries.map((entry, index) => (
							<tr key={index}>
								<td className="border px-4 py-2">
									<input
										type="number"
										value={entry.editableNumber}
										onChange={(e) => handleEditableNumberChange(index, e.target.value)}
										className="border p-1 rounded"
									/>
								</td>
								<td className="border px-4 py-2">{formatTime(entry.totalTime)}</td>
								<td className="border px-4 py-2">{entry.totalInputValue}</td>
								<td className="border px-4 py-2">{entry.date}</td>
								<td className="border px-4 py-2">
									{entry.averageTime || 'N/A'}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div >
	);
};

export default Timer;
