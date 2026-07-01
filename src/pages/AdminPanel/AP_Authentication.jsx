import React, {useEffect, useRef, useState} from 'react';
import {useServer} from "../../hooks/useServer";
import {useNavigate} from "react-router-dom";
import useData from "./useData";
import style from './AP_Authentication.module.scss';

const FLOW_FORMULA = {
    lineCount: 10,
    lineWidth: 1,
    speed: 0.00005,
    baseOpacity: 0.34,
    opacityStep: 0.013,
    waveAmplitudeX: 0.05,
    waveAmplitudeY: 0.15,
    waveFrequency: 3,
    laneSpread: 0.085,
    phaseShift: 0.22,
    samples: 56,
    targetFps: 30,
    maxDpr: 1.5,
    shadowBlur: 2
}

const ApAuthentication = () => {
    const {authentication} = useServer();
    const navigate = useNavigate();
    const {setAuthenticationData} = useData()

    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const flowCanvasRef = useRef(null)

    const isAuth = (result) => {
        if(result) {
            navigate('/admin-panel');
            setAuthenticationData({login:login, password:password})
        } else {
            setError('Неверный логин или пароль')
            setIsLoading(false)
        }
    }

    const handleLogin = async () => {
        if (!login.trim() || !password.trim()) {
            setError('Пожалуйста, заполните все поля')
            return
        }
        setError('')
        setIsLoading(true)
        await authentication({login:login, password:password}, isAuth)
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin()
        }
    }

    useEffect(() => {
        const canvas = flowCanvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        let animationId = null
        let width = 0
        let height = 0
        let lastDrawTime = 0
        let isPageVisible = !document.hidden

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, FLOW_FORMULA.maxDpr)
            width = canvas.offsetWidth
            height = canvas.offsetHeight
            canvas.width = Math.floor(width * dpr)
            canvas.height = Math.floor(height * dpr)
            context.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        const draw = (timestamp) => {
            if (!isPageVisible) {
                animationId = window.requestAnimationFrame(draw)
                return
            }

            const frameDuration = 1000 / FLOW_FORMULA.targetFps
            if (timestamp - lastDrawTime < frameDuration) {
                animationId = window.requestAnimationFrame(draw)
                return
            }
            lastDrawTime = timestamp

            const t = timestamp * FLOW_FORMULA.speed
            context.clearRect(0, 0, width, height)

            for (let index = 0; index < FLOW_FORMULA.lineCount; index++) {
                const offset = index - (FLOW_FORMULA.lineCount - 1) / 2
                const normalized = offset / ((FLOW_FORMULA.lineCount - 1) / 2)
                const linePhase = t + offset * FLOW_FORMULA.phaseShift

                const startX = width * (0.28 + normalized * 0.02)
                const startY = height * (1.05 + normalized * FLOW_FORMULA.laneSpread)
                const endX = width * 1.02
                const endY = height * (0.18 + normalized * FLOW_FORMULA.laneSpread)

                const samples = FLOW_FORMULA.samples
                context.beginPath()
                for (let step = 0; step <= samples; step++) {
                    const p = step / samples
                    const easing = p * p * (3 - 2 * p)
                    const baseX = startX + (endX - startX) * easing
                    const baseY = startY + (endY - startY) * easing

                    // Stronger lower-left bend + smooth travel to top-right.
                    const bendCurve = Math.exp(-Math.pow((p - 0.22) / 0.2, 2))
                    const bendX = -width * 0.11 * bendCurve
                    const bendY = height * 0.08 * bendCurve

                    // Wavy movement from explicit formula.
                    const wave = Math.sin((p * FLOW_FORMULA.waveFrequency * Math.PI * 2) + linePhase)
                    const waveX = wave * width * FLOW_FORMULA.waveAmplitudeX * (1 - p * 0.75)
                    const waveY = wave * height * FLOW_FORMULA.waveAmplitudeY * (1 - p * 0.85)

                    const x = baseX + bendX + waveX
                    const y = baseY + bendY + waveY

                    if (step === 0) {
                        context.moveTo(x, y)
                    } else {
                        context.lineTo(x, y)
                    }
                }

                context.lineWidth = FLOW_FORMULA.lineWidth
                context.strokeStyle = `rgba(67, 205, 255, ${FLOW_FORMULA.baseOpacity + index * FLOW_FORMULA.opacityStep})`
                context.shadowColor = 'rgba(24, 173, 255, 0.5)'
                context.shadowBlur = FLOW_FORMULA.shadowBlur
                context.stroke()
            }

            animationId = window.requestAnimationFrame(draw)
        }

        const handleVisibilityChange = () => {
            isPageVisible = !document.hidden
        }

        resize()
        animationId = window.requestAnimationFrame(draw)
        window.addEventListener('resize', resize)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            if (animationId) {
                window.cancelAnimationFrame(animationId)
            }
            window.removeEventListener('resize', resize)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [])

    return (
        <div className={style['container']}>
            <div className={style['backgroundMotion']} aria-hidden="true">
                <canvas ref={flowCanvasRef} className={style['flowCanvas']}></canvas>
            </div>
            <div className={style['card']}>
                <div className={style['title']}>Администратор</div>

                {error && (
                    <div className={style['error']}>
                        <span>⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                <div className={style['formGroup']}>
                    <label className={style['label']}>Логин</label>
                    <input
                        type="text"
                        className={style['input']}
                        placeholder="Введите логин"
                        value={login}
                        onChange={(event) => {
                            setLogin(event.target.value)
                            setError('')
                        }}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                </div>

                <div className={style['formGroup']}>
                    <label className={style['label']}>Пароль</label>
                    <input
                        type="password"
                        className={style['input']}
                        placeholder="Введите пароль"
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value)
                            setError('')
                        }}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                    />
                </div>

                <div className={style['buttonGroup']}>
                    <button
                        className={`${style['button']} ${style['buttonPrimary']} ${isLoading ? style['loading'] : ''}`}
                        onClick={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Загрузка...' : 'Войти'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApAuthentication;
