import React, { Component } from "react";
import { Col, Row, Container } from "../../components/Grid";
import Jumbotron from "../../components/Jumbotron";
import StartBtn from "../../components/StartBtn";
import { Input, FormBtn } from "../../components/Form";
import API from "../../utils/API";
import Player from "./Player";
import './game.css';
import Footer from '../../components/Footer/Footer';


class Game extends Component {
	state = {
		phrases: [],
		users: [],
		currPhraseToMatch: "",
		userPhrase: "",
		timer: 0,
		round: 0,
		roundStatus: "",
		roundScore: 0,
		roundScoreDisplay: "",
		interval: "",
		inProgress: false,
		playerOne: "Player One",
		playerTwo: "Player Two",
		playerOneScore: 0,
		playerTwoScore: 0,
		playerUp: "Player One",
	};

	componentDidMount() {
		this.setState({phrases: [{phrase: "Press start to begin"}]});
		this.loadUsers();
	}

	loadUsers = () => {
		API.getUsers()
			.then(res =>
				this.setState({ users: res.data })
			)
			.catch(err => console.log(err));
	};

	loadPhrases = () => {
		API.getPhrases()
			.then(res =>
				this.setState({ phrases: res.data })
			)
			.catch(err => console.log(err));
	};

	handleInputChange = event => {
		const { name, value } = event.target;
		this.setState({
			[name]: value
		});
	};
	
	startGame = () => {

		this.loadPhrases();
		clearInterval(this.state.interval);

		if(this.state.playerUp === "Player One") {
			this.setState({round: this.state.round + 1});
		}

		this.setState({
			timer: 0,
			interval: setInterval(this.increment, 1000),
			roundStatus: "",
			userPhrase: "",
			roundScoreDisplay: "",
			inProgress: true
		});
	};

	handlePhraseSubmit = event => {

		event.preventDefault();
		let game = this;

		clearInterval(this.state.interval);

		let targetPhrase = this.state.phrases[0].phrase.trim();
		let userPhrase = document.getElementById("inputPhrase").innerHTML

		// hit server for string comparison.
		// returns percentage match string to display
		API.compare(targetPhrase, userPhrase)
			.then(function(res) {

				game.setState({ roundStatus: res.data.numMatchedTokens + " out of " + res.data.numTargetTokens + " words: " +
				    (res.data.percentage * 100).toFixed(1).toString() + "% Match (" + res.data.numCharactersMatched + " / " +
					res.data.numTotalCharacters + " characters)" });
					
				game.setState({
					roundScore: Math.round(res.data.percentage * 100) + res.data.numCharactersMatched + (60 - game.state.timer)
				});

				game.setState({
					roundScoreDisplay: "Score: " + Math.round(res.data.percentage * 100) + " + " +
					res.data.numCharactersMatched + " + " + (60 - game.state.timer) + " = " + game.state.roundScore
				});
				
				// update player one score
				if(game.state.playerUp === "Player One") {
					game.setState({
						playerOneScore: game.state.playerOneScore + game.state.roundScore,
						playerUp: "Player Two"
					});
				}

				// update player two score
				else {
					game.setState({
						playerTwoScore: game.state.playerTwoScore + game.state.roundScore,
						playerUp: "Player One"
					});
				}
			})
			.catch(err => console.log(err));
	};

	increment = () => {
		this.setState({ timer: this.state.timer + 1 });
	};

	render() {
		return (
			<Container fluid>
				<Row>
					<Col size="md-12">
						<div id="roundHeight">
							<h2>{this.state.round === 0 ? " " : "Round: " + this.state.round}</h2>
							<h3>{this.state.inProgress ? this.state.playerUp : " "}</h3>
						</div>
					</Col>
				</Row>
				<Row>
					<Col size="md-12">
					<p  id="textPhrase">{<strong>{(!this.state.inProgress) ? "Press start to begin" : this.state.phrases[0].phrase}</strong>}</p>
					</Col>
				</Row>
				<Row>
					<Col size="md-1">
					</Col>
					<Col size="md-2">
						  <div className="thumbnail" id="thumbBord1">
							<h2 id="playerTitle1">{this.state.users[0] ? this.state.users[0].username : this.state.playerOne}</h2>
						  	<h2 id="playerScore1">{this.state.playerOneScore}</h2>
							<Player imgURL="https://d30y9cdsu7xlg0.cloudfront.net/png/16846-200.png" alter="image1"/> 
						  </div>
					</Col>
					<Col size="md-6">
						<Jumbotron>
							
							<div id="timer">
								<h2>{this.state.inProgress ? this.state.timer : " "}</h2>
							</div>
							<StartBtn onClick={() => this.startGame()}>
								<i className="fa fa-microphone" aria-hidden="true"></i> Start
							</StartBtn>
							<br />
							<h4 id = "inputPhrase">User Phrase: {this.state.userPhrase}</h4>
							<form>
								<Input
									className="text"
									value={this.state.userPhrase}
									onChange={this.handleInputChange}
									name="userPhrase"
									autoComplete="off" />
								<FormBtn
//									disabled={(!this.state.userPhrase || !this.state.inProgress)}
									onClick={this.handlePhraseSubmit}>
									Submit
								</FormBtn>
								<div  id="userStatus">
									<h2 id="fontH2">{this.state.roundStatus}</h2>
									<h2 id="fontH2">{this.state.roundScoreDisplay}</h2>
								</div>
							</form>
						</Jumbotron>
					</Col>
					<Col size="md-2">
					
					<div className="thumbnail" id="thumbBord2">
						<h2 id="playerTitle2">{this.state.users[1] ? this.state.users[1].username : this.state.playerTwo}</h2>
						  	<h2 id="playerScore2">{this.state.playerTwoScore}</h2>
							<Player imgURL="https://d30y9cdsu7xlg0.cloudfront.net/png/16846-200.png" alter="image1"/> 
						  </div>
					</Col>
					<Col size="md-1">
					</Col>
				</Row>
				{/* <Row>
					<Col size="md-12">
						<p  id="userStatus">
							<h2 id="fontH2">{this.state.roundStatus}</h2>
							<h2 id="fontH2">{this.state.roundScoreDisplay}</h2>
						</p>
					</Col>
				</Row> */}
				<br />
				<Row>
					<Col size="md-12">
						 <Footer /> 
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Game;