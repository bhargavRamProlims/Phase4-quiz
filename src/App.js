import React, { Component } from 'react';
import './App.css';

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            quiz: require('../quiz.json'),
            activeView: null,
            currentQuestionIndex: 0,
            answers: []
        };
    }

    showQuizDescription = () => {
        this.setState((prevState, props) => {
            return {
                activeView: 'quizOverview'
            };
        });
    }

    showQuizQuestion = (index) => {
        console.log(index);
        this.setState((prevState) => {
            return {
                currentQuestionIndex: index,
                activeView: 'quizQuestions',
                buttonsDisabled: false,
                transitionDelay: 1000
            };
        });
    };

    showResults = () => {
        this.setState((prevState) => {
            return {
                activeView: 'quizResults'
            };
        });
    }

    submitAnswer = (answer) => {
        var app = this;
        this.setState((prevState) => {
            return {
                buttonsDisabled: true,
                answers: Object.assign({ [this.state.currentQuestionIndex]: answer }, prevState.answers)
            };
        });
        window.setTimeout(function () {
            let nextIndex = app.state.currentQuestionIndex + 1,
                hasMoreQuestions = (nextIndex < app.state.quiz.numOfQuestions);
            (hasMoreQuestions) ? app.showQuizQuestion(nextIndex) : app.showResults();
        }, this.state.transitionDelay);
    };

    getResults = () => {
        return this.state.quiz.questions.map((item, index) => {
            return Object.assign({}, item, this.state.answers[index]);
        });
    };

    componentDidMount() {
        this.showQuizDescription();
    };

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <h2 style={{ fontFamily: 'Verdana', fontSize: '2em' }}>
                        {this.state.quiz.title}
                    </h2>
                </div>

                {this.state.activeView === 'quizOverview' &&
                    <QuizDescription
                        quiz={this.state.quiz}
                        showQuizQuestion={this.showQuizQuestion.bind(this, 0)}
                    />
                }
                {this.state.activeView === 'quizQuestions' &&
                    <Quizques
                        submitAnswer={this.submitAnswer}
                        quiz={this.state.quiz}
                        currentQuestionIndex={this.state.currentQuestionIndex}
                        buttonsDisabled={this.state.buttonsDisabled}
                        transitionDelay={this.state.transitionDelay}
                    />
                }
                {this.state.activeView === 'quizResults' &&
                    <QuizResults
                        results={this.getResults()}
                    />
                }
            </div>
        );
    };

}

class QuizDescription extends Component {
    render() {
        let quiz = this.props.quiz;
        let htmlDescription = function () { return { __html: quiz.description }; };

        return (
            <section className="overviewSection">
                <div className="description" dangerouslySetInnerHTML={htmlDescription()} />
                <button onClick={this.props.showQuizQuestion} size="lg">Begin</button>
            </section>
        );
    };
}

class Quizques extends Component {
    handleClick(index, event) {
        let question = this.props.quiz.questions[this.props.currentQuestionIndex],
            answer = { value: index + 1, isCorrect: (index + 1 === question.correct) },
            target = event.currentTarget;

        this.props.submitAnswer(answer);

        target.classList.add('clicked', answer.isCorrect ? 'correct' : 'incorrect');

        window.setTimeout(function () {
            target.classList.remove('clicked', 'correct', 'incorrect');
        }, this.props.transitionDelay);
    };

    render() {
        let quiz = this.props.quiz,
            question = this.props.quiz.questions[this.props.currentQuestionIndex],
            htmlQuestion = function () {
                return { __html: question.question };
            },
            answerButtons = question.answers.map((answer, index) =>
                <p key={index}>
                    <button className={answer.answer}
                        onClick={this.handleClick.bind(this, index)}
                        disabled={this.props.buttonsDisabled}>
                        {answer}
                    </button><br/><br/>
                </p>
            );

        return (
            <section className={'quizSection' + (this.props.buttonsDisabled ? ' transitionOut' : '')}>
                <div className="questionNumber">Question {this.props.currentQuestionIndex + 1} / {quiz.questions.length}</div>
                <hr />
                <div className="question">
                    <div dangerouslySetInnerHTML={htmlQuestion()} />
                </div>
                <div className="answers">
                    {answerButtons}
                </div>
            </section>
        );
    }
}

class QuizResults extends Component {
    render() {
        let numCorrect = 0, score = 0, possibleScore = 0;

        this.props.results.forEach((answer) => {
            if (!!answer.isCorrect) {
                numCorrect += 1;
                score += ((answer.level || 1) * 10);
            }
            possibleScore += ((answer.level || 1) * 10);
        });

        const results = this.props.results.map((item, index) => {
            let question = () => { return { __html: item.question }; };
            let explanation = () => { return { __html: item.explanation }; };
            let response = (item.isCorrect === true) ? "You correctly answered " :
                    (item.isCorrect === false) ? `You answered ${item.answers[item.value - 1]}. The correct answer is ` : "The correct answer is ";
            return (
                <li className={"result" + (item.isCorrect ? " correct" : " incorrect")} key={index}>
                    <div className="question" dangerouslySetInnerHTML={question()} />
                    <div className="response">
                        {response} <b>{item.answers[item.correct - 1]}</b>
                    </div>
                    <p className="explanation">
                        <i dangerouslySetInnerHTML={explanation()} />
                    </p>
                </li>
            );
        });

        return (
            <section className="resultsSection">
                <h2>Results</h2>
                <div className="scoring">
                    You got <em>{numCorrect}</em> correct. Total Score is <b>{score}</b> out of <b>{possibleScore}</b>.
                </div>
                <ol>{results}</ol>
            </section>
        );
    }
}

