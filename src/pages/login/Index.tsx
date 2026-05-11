import Input from '../../components/ui/Input'
import logo from '../../assets/logo.png'
import { AuthService } from '../../services/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router';

function LoginPage() {
    const navigate = useNavigate();
    
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [inputs, setInputs] = useState({
        email: '',
        password: ''
    })
    
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value, name} = e.target;
        setInputs(prev => ({
        ...prev,
        [name]: value
        }));
    }

const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();           // 폼 기본 동작(페이지 새로고침) 막기
    setError(null);
    setIsLoading(true);
    try {
      await AuthService.login({ email: inputs.email, password: inputs.password });
      navigate('/dashboard');
    } catch (err) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

    
    return (
        <div className="bg-background font-body text-on-surface min-h-screen flex flex-col items-center justify-center p-6 selection:bg-primary-fixed selection:text-on-primary-fixed">
        <main className="w-full max-w-md">
            <div className="bg-surface-container-lowest ambient-shadow p-8 md:p-12 rounded-xl flex flex-col space-y-8">
                <header className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <img src={logo} alt="아가베 로고" className="h-24 w-24 object-contain" />
                    </div>
                    <h1 className="font-headline font-black text-2xl tracking-tighter text-primary">
                        AGAVE
                    </h1>
                    <p className="text-on-surface-variant font-medium text-sm">
                        구조화된 준비가, 흔들림 없는 답을 만든다
                    </p>
                </header>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        icon="mail"
                        id="email"
                        name="email"
                        placeholder="example@scholarly.ac"
                        type="email"
                        onChange={onChange}
                    />
                    <Input
                        icon="lock"
                        id="password"
                        name="password"
                        placeholder="••••••••"
                        type="password"
                        onChange={onChange}
                    />
                    <div className="flex items-center justify-between">
                        {/* <label className="flex items-center space-x-2 cursor-pointer group">
                            <input
                                className="rounded-sm border-outline-variant text-primary focus:ring-primary focus:ring-offset-background transition-colors"
                                type="checkbox"
                            />
                            <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">
                                자동 로그인
                            </span>
                        </label> */}
                        <a
                            className="text-sm font-semibold text-primary hover:text-primary-container transition-colors"
                            href="#"
                        >
                            비밀번호를 잊으셨나요?
                        </a>
                    </div>
                    <button
                        className="w-full primary-gradient text-on-primary py-4 rounded-lg font-headline font-bold text-base hover:opacity-90 transition-all active:scale-[0.98] ambient-shadow"
                        type="submit"
                    >
                        로그인
                    </button>
                </form>
                {/* <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-outline-variant/20"></div>
                    <span className="flex-shrink mx-4 text-xs font-semibold text-outline tracking-widest uppercase">
                        또는 다음으로 계속
                    </span>
                    <div className="flex-grow border-t border-outline-variant/20"></div>
                </div> */}
                {/* <div className="grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center space-x-2 bg-surface-container hover:bg-surface-container-high py-3 rounded-lg transition-colors border border-outline-variant/10">
                        <span className="material-symbols-outlined text-lg">google</span>
                        <span className="font-label text-sm font-bold text-on-surface-variant">Google</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 bg-surface-container hover:bg-surface-container-high py-3 rounded-lg transition-colors border border-outline-variant/10">
                        <span className="material-symbols-outlined text-lg">ios</span>
                        <span className="font-label text-sm font-bold text-on-surface-variant">Apple</span>
                    </button>
                </div> */}
                <footer className="text-center pt-4">
                    <p className="text-on-surface-variant text-sm font-medium">
                        계정이 없으신가요?
                        <a
                            className="text-primary font-bold ml-1 hover:underline decoration-primary/30 underline-offset-4 transition-all"
                            href="#"
                        >
                            회원가입
                        </a>
                    </p>
                </footer>
            </div>
            <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]"></div>
            </div>
        </main>
        </div>
    );
}

export default LoginPage;
