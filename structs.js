class TestResult {
    constructor(testedPPD, correctAnswers, rounds, squareSizePx) {
        this.testedPPD = testedPPD;
        this.correctAnswers = correctAnswers;
        this.rounds = rounds;
        this.squareSizePx = squareSizePx;
    }

    // Guess rate
    ratio() {
        return this.correctAnswers/this.rounds;
    }
}