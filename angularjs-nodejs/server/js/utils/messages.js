export default {
	getWelcome: () => {
		const hour = new Date().getHours();
		const messages = {
			morning: 'Good morning',
			afternoon: 'Good afternoon',
			evening: 'Good evening'
		};

		if (hour >= 0 && hour <= 12) {
			return messages.morning;
		} else if (hour > 12 && hour <= 17) {
			return messages.afternoon;
		} else {
			return messages.evening;
		}
	}
};