export class Notifier {
    /**
     * Method used to notify the user about data reaching threshold
     * @note This base interface method must be overridden by a concrete notifier!
     * @param {Object} data The notification values to be sent
     * @returns false due to the fact that this method shouldn't be called directly
     */
    async notify(data) {
        console.error("Please select a valid notifier.")
        return false;
    }
}