/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { classNames } from 'primereact/utils';
import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { AppTopbarRef } from '@/types';
import { LayoutContext } from './context/layoutcontext';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';


const AppTopbar = forwardRef<AppTopbarRef>((props, ref) => {
    const { layoutState, onMenuToggle, showProfileSidebar } = useContext(LayoutContext);
    const menubuttonRef = useRef(null);
    const topbarmenuRef = useRef(null);
    const topbarmenubuttonRef = useRef(null);
    const [logoutDialog, setLogoutDialog] = useState(false);

    useImperativeHandle(ref, () => ({
        menubutton: menubuttonRef.current,
        topbarmenu: topbarmenuRef.current,
        topbarmenubutton: topbarmenubuttonRef.current
    }));

    const logout = () => {
            fetch('/api/logout')
            .then(() => {
                window.location.href = '/login'; // Redireciona manualmente
            })
            .catch((err) => {
                console.error('Erro ao fazer logout:', err);
            });
        }
    
     const logoutDialogFooter = (
        <>
          <Button label="Não" icon="pi pi-times" text onClick={() => setLogoutDialog(false)} />
          <Button label="Sim" icon="pi pi-check" text onClick={logout} />
        </>
      );
    

    return (
        <div className="layout-topbar">
            <Link href="/" className="layout-topbar-logo">
                <img src={`/layout/images/logo-agrocontar.webp`} width="auto" height={'35px'} alt="logo" />
            </Link>

            <button ref={menubuttonRef} type="button" className="p-link layout-menu-button layout-topbar-button" onClick={onMenuToggle}>
                <i className="pi pi-bars" />
            </button>

            <button ref={topbarmenubuttonRef} type="button" className="p-link layout-topbar-menu-button layout-topbar-button" onClick={showProfileSidebar}>
                <i className="pi pi-ellipsis-v" />
            </button>

            <div ref={topbarmenuRef} className={classNames('layout-topbar-menu', { 'layout-topbar-menu-mobile-active': layoutState.profileSidebarVisible })}>
                
                {/* PROFILE BUTTON */}
                {/* <button type="button" className="p-link layout-topbar-button">
                    <i className="pi pi-user"></i>
                    <span>Profile</span>
                </button> */}

                <button 
                    type="button" 
                    onClick={() => {
                        window.open('/docs/ajuda.pdf', '_blank')
                    }} 
                    className="p-link layout-topbar-button"
                >
                    <i className="pi pi-question-circle"></i>
                    <span>Ajuda</span>
                </button>

                {/* LOGOUT BUTTON */}
                <button type="button" className="p-link layout-topbar-button" onClick={() => setLogoutDialog(true)}>
                    <i className="pi pi-sign-out"></i>
                    <span>Logout</span>
                </button>

                
            </div>

            <Dialog visible={logoutDialog} style={{ width: '450px' }} header="Sair do Sistema" modal footer={logoutDialogFooter} onHide={() => setLogoutDialog(false)}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle mr-3" />
                    <span>Deseja sair do sistema?</span>
                </div>
            </Dialog>
        </div>
    );
});

AppTopbar.displayName = 'AppTopbar';

export default AppTopbar;
