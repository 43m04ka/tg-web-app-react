import style from './DanyaDr.module.scss';
import React, { useState } from 'react';
import s from './DanyaDrStyles.module.scss';


const QUIZ_DATA = [
    {
        question: "Что из этого твой пароль от эл. дневника?",
        options: ["as5d4faffa", "28032008cgsc", "danya.gay", "uhaiuhdywetyw"],
        correctAnswer: "-",
        memoryNote: "Хз, его только создатель дневника знает (не факт)"
    },
    {
        question: "Дань, можешь набрать в полицию, я занят",
        options: ["Настолько занят?", "вхавха чо нахуй", "что случилось ? ", "куда вызывать ? "],
        correctAnswer: "вхавха чо нахуй",
        memoryNote: "P.S. нужно было вызывать дурку"
    },
    {
        question: "Я - программист, ты - инветсор, а леша - ...",
        options: ["Немыслимый педик", "Сказочный дурачок", "Крутой воздухан", "Чертов гений"],
        correctAnswer: "Крутой воздухан",
        memoryNote: "Быстрее переходи на сл. вопрос, у меня ветром окна выбило"
    },
    {
        question: "- Серёжааа, тут тореева пришла, ты чо назад поедешь \n- Ну да, мне тут недалеко, от ...",
        options: ["Ярославля", "Пятёрочки", "Калиновского", "Филармонии"],
        correctAnswer: "Филармонии",
        memoryNote: "хзавхза бля без комментариев"
    },
    {
        question: "Уебашили все 100 профилей в корзину. Из корзины тоже. Кто остался в живых?",
        options: ["Крутой воздухан", "Бенжамин Александр", "Мистер точка", "Чикатулус Даниилус"],
        correctAnswer: "Бенжамин Александр", 
        memoryNote: "Ходят слухи что он свою сессию с рождения не завершал"
    }
];

const DanyaDr = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleAnswerSelect = (option) => {
        if (isConfirmed) return;
        setSelectedAnswer(option);
    };

    const handleConfirm = () => {
        if (!selectedAnswer) return;
        if (selectedAnswer === QUIZ_DATA[currentStep].correctAnswer) {
            setScore(score + 1);
        }
        setIsConfirmed(true);
    };

    const handleNext = () => {
        const nextStep = currentStep + 1;
        if (nextStep < QUIZ_DATA.length) {
            setCurrentStep(nextStep);
            setSelectedAnswer(null);
            setIsConfirmed(false);
        } else {
            setShowResult(true);
        }
    };

    if (showResult) {
        return (
            <div className={style.container}>
                <div className={s.resultCard}>
                    <div className={s.resultTitle}>Красавчик! 🎉</div>
                    <div className={s.resultScore}>Ты набрал {score + 1} из {QUIZ_DATA.length} баллов.</div>
                    <p className={s.resultMessage}>
                        Спасибо тебе за все Дань, очень ценю то что ты появился в моей жизни, желаю тебе всего наилучшего, в частности удачно сдать егэ. Безусловно, можно много чего еще написать и пожелать, но я не хочу превращать это в банальную речь, так что просто знай, что ты крутой и я тебя люблю ❤️
                    </p>
                </div>
            </div>
        );
    }

    const currentQuestion = QUIZ_DATA[currentStep];

    return (
        <div className={style.container}>
            <div className={s.quizCard}>
                <div className={s.questionCounter}>
                    Вопрос {currentStep + 1} из {QUIZ_DATA.length}
                </div>

                <h3 className={s.questionTitle}>
                    {currentQuestion.question}
                </h3>

                <div className={s.imageContainer}>
                    <img 
                        src={require(`./images/${currentStep + 1}.png`)} 
                        alt={`Question ${currentStep + 1}`}
                        className={s.image}
                    />
                </div>

                <div className={s.optionsContainer}>
                    {currentQuestion.options.map((option) => {
                        let optionClass = s.option;
                        if (selectedAnswer === option) optionClass += ` ${s.selected}`;
                        if (isConfirmed) {
                            if (option === currentQuestion.correctAnswer) optionClass += ` ${s.correct}`;
                            else if (selectedAnswer === option) optionClass += ` ${s.incorrect}`;
                        }

                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswerSelect(option)}
                                disabled={isConfirmed}
                                className={optionClass}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>

                {isConfirmed && (
                    <div className={s.memoryNote}>
                        💡 {currentQuestion.memoryNote}
                    </div>
                )}

                <div className={s.buttonContainer}>
                    {!isConfirmed ? (
                        <button
                            onClick={handleConfirm}
                            disabled={!selectedAnswer}
                            className={s.confirmBtn}
                        >
                            Ответить
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className={s.nextBtn}
                        >
                            {currentStep + 1 === QUIZ_DATA.length ? "Результат" : "Дальше →"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DanyaDr;
