import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ChevronLeft, MessageCircle, ExternalLink } from 'lucide-react';
import { useModal } from '../contexts/ModalContext';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const LINE_OFFICIAL_ACCOUNT_URL = 'https://line.me/R/ti/p/@your_id'; // 実際のLINE公式アカウントのURLに置き換えてください

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [studentId, setStudentId] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [lineSent, setLineSent] = useState(false);
    const navigate = useNavigate();
    const { openModal } = useModal();
    const codeInputs = useRef([]);

    // ステップ1: 認証コード送信
    const handleSendCode = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('認証コード送信(API):', { student_id: studentId });
            
            const response = await fetch(`${API_BASE_URL}/api/password-reset/send-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: studentId }),
            });

            const data = await response.json();

            if (!response.ok) {
                // LINE連携されていない、またはその他のエラー
                if (response.status === 404 || data.error === 'line_not_linked') {
                    openModal({
                        type: 'error',
                        title: 'LINE連携未完了',
                        message: data.message || 'LINE連携が確認できません。管理者にお問い合わせください。',
                        confirmText: '閉じる'
                    });
                } else {
                    throw new Error(data.message || '認証コードの送信に失敗しました');
                }
                return;
            }

            // 成功時
            setLineSent(true);
            setTimeout(() => setStep(2), 500); 
        } catch (err) {
            console.error('API Error:', err);
            setError(err.message || 'エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    // ステップ2: パスワードリセット
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('パスワードが一致しません');
            return;
        }

        const codeString = verificationCode.join('');
        if (codeString.length !== 6) {
            setError('6桁の認証コードを入力してください');
            return;
        }

        setLoading(true);
        try {
            console.log('パスワード更新(API):', {
                student_id: studentId,
                code: codeString,
            });

            const response = await fetch(`${API_BASE_URL}/api/password-reset/verify-and-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: studentId,
                    code: codeString,
                    new_password: password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'パスワードの更新に失敗しました');
            }

            openModal({
                type: 'success',
                title: '完了',
                message: 'パスワードを更新しました。新しいパスワードでログインしてください。',
                onConfirm: () => navigate('/login')
            });
            
            // 2秒後に自動遷移（モーダルを閉じなかった場合用）
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            setError(err.message || 'エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    // 認証コード入力のハンドリング
    const handleCodeChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...verificationCode];
        newCode[index] = value.slice(-1);
        setVerificationCode(newCode);

        // 自動フォーカス移動
        if (value && index < 5) {
            codeInputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            codeInputs.current[index - 1].focus();
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-6 md:p-8">
                {/* 戻るボタン */}
                <button 
                    onClick={() => step === 1 ? navigate('/login') : setStep(1)}
                    className="flex items-center text-stone-600 mb-6 hover:text-stone-900 transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="text-sm font-medium">戻る</span>
                </button>

                <h1 className="text-2xl font-bold text-stone-800 mb-2">
                    {step === 1 ? 'パスワードをお忘れですか？' : 'パスワードをリセット'}
                </h1>
                <p className="text-stone-500 text-sm mb-8">
                    {step === 1 
                        ? '学生番号を入力してください。連携済みのLINEアカウントに認証コードを送信します。'
                        : 'LINEに届いた6桁の認証コードと、新しいパスワードを入力してください。'}
                </p>

                {lineSent && step === 2 && (
                    <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded flex items-start gap-3 animate-in fade-in slide-in-from-top duration-500">
                        <MessageCircle className="text-green-600 shrink-0" size={20} />
                        <div>
                            <p className="text-sm font-bold">LINEに認証コードを送信しました</p>
                            <p className="text-xs mt-1">トーク画面を確認してください。</p>
                            <a 
                                href={LINE_OFFICIAL_ACCOUNT_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-bold text-green-700 mt-2 hover:underline"
                            >
                                LINEを開く <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 text-sm rounded">
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    /* ステップ1: 学生番号入力 */
                    <form onSubmit={handleSendCode} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                                学生番号
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                                placeholder="例: 123456"
                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-mos-green focus:border-transparent outline-none transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !studentId}
                            className="w-full bg-mos-green hover:bg-mos-green-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '送信中...' : '認証コードを送信'}
                        </button>
                    </form>
                ) : (
                    /* ステップ2: 認証コード & パスワード入力 */
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-stone-700 mb-3 uppercase tracking-wider">
                                認証コード (6桁)
                            </label>
                            <div className="flex justify-between gap-2">
                                {verificationCode.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => codeInputs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-xl font-bold bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-mos-green focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                                    新しいパスワード
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-mos-green focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                                    新しいパスワード (確認)
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-mos-green focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || verificationCode.some(d => !d) || !password}
                            className="w-full bg-mos-green hover:bg-mos-green-dark text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '更新中...' : 'パスワードを更新してログイン'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm font-bold text-mos-green hover:text-mos-green-dark transition-colors">
                        ログイン画面に戻る
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
