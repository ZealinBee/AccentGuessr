"use client";
import { useState } from "react";
import Link from "next/link";
import Game from "./Game";
import "../scss/Home.scss";
import LoginButton from "./GoogleLoginButton";
import { useGame } from "../hooks/useGame";
import useAuth from "../hooks/useAuth";
import DashboardIcon from "./DashboardIcon";
import { User, Users, Mic, ChevronDown } from "lucide-react";
import { track } from "../lib/firebase";

function Home() {
  const { startGame, isLoading, gameData } = useGame();
  const { isLoggedIn } = useAuth();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is AccentGuessr?",
      answer:
        "AccentGuessr is an interactive game where you listen to short audio clips of people speaking English and try to guess their accent or country of origin. It's a fun way to learn about different English accents from around the world.",
    },
    {
      question: "How do I play the accent guessing game?",
      answer:
        "Simply click the 'Singleplayer' button to start a game. You'll hear an audio clip of someone speaking English. Listen carefully and select the country or region where you think the speaker is from. You can play solo or challenge friends in multiplayer mode.",
    },
    {
      question: "What accents are included in the game?",
      answer:
        "AccentGuessr features English accents from countries and regions around the world, including American, British, Australian, Indian, Canadian, South African, and many more. The collection is constantly growing thanks to our volunteer contributors.",
    },
    {
      question: "Can I contribute my own accent?",
      answer:
        "Yes! Click the 'Volunteer Your Accent' button to record yourself speaking. Your contribution helps make the game more diverse and educational for players worldwide.",
    },
    {
      question: "Is AccentGuessr free to play?",
      answer:
        "Yes, AccentGuessr is completely free to play. You can enjoy unlimited rounds of accent guessing in both singleplayer and multiplayer modes without any cost.",
    },
    {
      question: "Do I need to create an account?",
      answer:
        "You can play without an account, but logging in with Google allows you to track your progress, save your scores, and compete with other players on the leaderboard.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const copyEmailToClipboard = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigator.clipboard.writeText("zhiyuan.liu@tuni.fi");
  };

  return (
    <>
      {!gameData && (
        <>
          {!isLoggedIn && (
            <div className="absolute-button">
              <LoginButton />
            </div>
          )}

          {isLoggedIn && <DashboardIcon />}

          <div className="home-container">
            <div className="background-image" />
            <div className="background-overlay" />

            <div className="content">
              <div className="welcome-card">
                <h1 className="title">Can you Guess the English Accent?</h1>
                <p className="description">
                  Try to see if you can tell where this person is from by their
                  English accent.
                </p>
                <button
                  onClick={() => startGame()}
                  className="start-button"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  <User size={18} />
                  <span>Singleplayer</span>
                  {isLoading && (
                    <>
                      <span className="loading-spinner" aria-hidden="true" />
                      <span className="sr-only">Loading…</span>
                    </>
                  )}
                </button>
                <Link href="/multiplayer" className="start-button">
                  <Users size={18} />
                  <span>Multiplayer</span>
                </Link>
                <Link href="/volunteer" className="start-button volunteer-button">
                  <Mic size={18} />
                  <span>Volunteer Your Accent</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="buy-me-coffee-wrapper">
            <a
              href="https://buymeacoffee.com/zhiyuanliu"
              target="_blank"
              rel="noreferrer"
              onClick={() => track("buy_coffee_click", { source: "home_page" })}
            >
              {" "}
              <img src="/buymecoffeebutton.png" />
            </a>
            <span className="feedback-text">
              Feedbacks are welcomed:{" "}
              <a
                href="mailto:zhiyuan.liu@tuni.fi"
                className="feedback-email"
                onClick={copyEmailToClipboard}
              >
                zhiyuan.liu@tuni.fi
              </a>
            </span>
          </div>

          <div className="faq-section">
            <div className="faq-header">
              <h2 className="faq-title">Frequently Asked Questions</h2>
              <p className="faq-subtitle">
                Everything you need to know about AccentGuessr
              </p>
            </div>
            <div className="faq-container">
              {faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <button
                    className="faq-question-button"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={openFaqIndex === index}
                  >
                    <h3 className="faq-question">{faq.question}</h3>
                    <ChevronDown
                      size={20}
                      className={`faq-icon ${
                        openFaqIndex === index ? "faq-icon-open" : ""
                      }`}
                    />
                  </button>
                  {openFaqIndex === index && (
                    <div className="faq-answer-wrapper">
                      <p className="faq-answer">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="video-section">
            <div className="video-header">
              <h2 className="video-title">See How It Works</h2>
              <p className="video-subtitle">
                Watch a quick playthrough of AccentGuessr
              </p>
            </div>
            <div className="video-wrapper">
              <iframe
                src="https://www.youtube.com/embed/W9TXs8Xekik"
                title="AccentGuessr Playthrough"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </>
      )}
      {gameData && <Game />}
    </>
  );
}

export default Home;
