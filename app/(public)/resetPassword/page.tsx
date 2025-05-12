/* eslint-disable @next/next/no-img-element */
'use client';
import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import Swal from 'sweetalert2'
import { ProgressSpinner } from 'primereact/progressspinner';

const ResetPasswordPage = () => {
    const [checked, setChecked] = useState(false);
    const { layoutConfig } = useContext(LayoutContext);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmite = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (password !== confirmPassword) {
            Swal.fire({
                title: "Erro!",
                text: "As senhas não coincidem.",
                icon: "error",
            });
            setLoading(false);
            return;
        }
        if (password.length < 6) { 
            Swal.fire({
                title: "Erro!",
                text: "A senha deve ter pelo menos 6 caracteres.",
                icon: "error",
            });
            setLoading(false);
            return;
        }

        const token = new URLSearchParams(window.location.search).get('AgroFinancesToken');
        if (!token) {
            Swal.fire({
          title: "Erro!",
          text: "Token não encontrado na URL.",
          icon: "error",
            });
            setLoading(false);
            return;
        }
        
        console.log('Token:', token); // Verifica se o token está sendo capturado corretamente
        console.log(password)

        try {
            const res = await fetch('/api/forgetPassword/resetPassword', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // ESSENCIAL para enviar e receber cookies
                body: JSON.stringify({ newPassword: password, token })
            });
    
            const data = await res.json();
    
            if (!res.ok) {
                Swal.fire({
                    title: "Erro!",
                    text: data.error,
                    icon: "error",
                });
                setLoading(false);
                return;
            }
        
            router.push('/login');
        } catch (err) {
            console.error('Erro inesperado:', err);
            setLoading(false);
        }
    };
    


    const router = useRouter();
    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    return (
        <div className={containerClassName}>
            <div className="flex flex-column align-items-center justify-content-center">
                <img src={`/layout/images/logo-agrocontar.webp`} alt="Sakai logo" className="mb-5 w-6rem flex-shrink-0" />
                <div
                    style={{
                        borderRadius: '56px',
                        padding: '0.3rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)'
                    }}
                >
                    <div className="w-full surface-card py-8 px-5 sm:px-8" style={{ borderRadius: '53px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-medium mb-3">Agro Finanças</div>
                            <span className="text-600 font-medium line-height-3">Entre com sua conta</span>
                        </div>

                        <form onSubmit={handleSubmite} >
                            <label htmlFor="password1" className="block text-900 font-medium text-xl mb-2">
                                Nova Senha:
                            </label>
                            <Password 
                                inputId="password1" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="Nova Senha" 
                                feedback={false}
                                className="w-full md:w-30rem mb-5" 
                                inputClassName="w-full p-3 md:w-30rem">

                            </Password>
                            
                            <label htmlFor="password2" className="block text-900 font-medium text-xl mb-2">
                                Confirmar Senha:
                            </label>
                            <Password 
                                inputId="password2" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                placeholder="Confirmar Senha" 
                                feedback={false}
                                className="w-full mb-5" 
                                inputClassName="w-full p-3 md:w-30rem">

                            </Password>

                            {loading ? (
                                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="6" />
                            ) : (
                                <Button label="Atualizar" className="w-full p-3 text-xl " type="submit" />
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
