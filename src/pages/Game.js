import propTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Header from '../components/Header';
import triviaApi from '../services/triviaApi';
import { token as tokenAction } from '../redux/actions';
import requestToken from '../services/tokenApi';

class Game extends Component {
  constructor() {
    super();

    this.state = {
      apiReturn: [],
      allAnswers: [],
      currQuestion: 0,
    };

    this.saveQuestions = this.saveQuestions.bind(this);
    this.answerButton = this.answerButton.bind(this);
  }

  componentDidMount() {
    this.saveQuestions();
  }

  async saveQuestions() {
    const ERROR_RESPONSE = 3;
    const ARRAY_LENGTH = 0.5;
    const { token, renewToken } = this.props;
    const { currQuestion } = this.state;
    const apiReturn = await triviaApi(token);

    if (apiReturn.response_code === ERROR_RESPONSE) {
      const newToken = await requestToken();
      const apiNewReturn = await triviaApi(newToken.token);
      const { results } = apiNewReturn;
      const incorrectAnswers = results[currQuestion].incorrect_answers;
      const correctAnswer = results[currQuestion].correct_answer;

      this.setState({
        apiReturn: apiNewReturn.results,
        allAnswers: [...incorrectAnswers, correctAnswer]
          .sort(() => Math.random() - ARRAY_LENGTH),
      });
      renewToken(newToken);
    } else {
      const { results } = apiReturn;
      const incorrectAnswers = results[currQuestion].incorrect_answers;
      const correctAnswer = results[currQuestion].correct_answer;

      this.setState({
        apiReturn: apiReturn.results,
        allAnswers: [...incorrectAnswers, correctAnswer]
          .sort(() => Math.random() - ARRAY_LENGTH),
      });
    }
  }

  answerButton() {
    const ARRAY_LENGTH = 0.5;

    this.setState((prevState) => ({
      currQuestion: prevState.currQuestion + 1,
    }), () => {
      const { apiReturn, currQuestion } = this.state;
      const incorrectAnswers = apiReturn[currQuestion].incorrect_answers;
      const correctAnswer = apiReturn[currQuestion].correct_answer;

      this.setState({
        allAnswers: [...incorrectAnswers, correctAnswer]
          .sort(() => Math.random() - ARRAY_LENGTH),
      });
    });
  }

  render() {
    const { apiReturn, currQuestion, allAnswers } = this.state;
    console.log(apiReturn);
    return (
      <>
        <Header />
        <main>
          <h4
            data-testid="question-category"
          >
            { apiReturn.length > 0 && apiReturn[currQuestion].category}
          </h4>
          <h3
            data-testid="question-text"
          >
            { apiReturn.length > 0 && apiReturn[currQuestion].question}
          </h3>
          <section data-testid="answer-options">
            {
              apiReturn.length > 0
            && allAnswers
              .map((answer, i) => (
                answer.match(apiReturn[currQuestion].correct_answer)
                  ? (
                    <button
                      type="button"
                      key={ i }
                      data-testid="correct-answer"
                    >
                      {answer}
                    </button>)
                  : (
                    <button
                      type="button"
                      key={ i }
                      data-testid={ `wrong-answer-${i}` }
                    >
                      {answer}
                    </button>)
              ))
            }
            <button type="button" onClick={ this.answerButton }>Teste</button>
          </section>
        </main>
      </>
    );
  }
}

Game.propTypes = {
  token: propTypes.object,
}.isRequired;

const mapStateToProps = (state) => {
  const { token } = state;
  return {
    token,
  };
};

const mapDispatchToProps = (dispatch) => ({
  renewToken(token) {
    dispatch(tokenAction(token));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Game);