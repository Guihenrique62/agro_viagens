/* eslint-disable @next/next/no-img-element */

import React, { useContext, useEffect, useState } from 'react';
import AppMenuitem from './AppMenuitem';
import { LayoutContext } from './context/layoutcontext';
import { MenuProvider } from './context/menucontext';
import Link from 'next/link';
import { AppMenuItem } from '@/types';
import {jwtDecode} from "jwt-decode";

type JwtPayload = {
    exp: number;
    role?: string;
    [key: string]: any;
};

const AppMenu = () => {
    const { layoutConfig, user} = useContext(LayoutContext);

    const isAdmin = user?.role === 'Administrador';


    const model: AppMenuItem[] = [
        {
            label: 'Home',
            items: [{ label: 'Viagens', icon: 'pi pi-fw pi-home', to: '/' }]
        },
        ...(isAdmin
            ? [
                {
                    label: 'Administração',
                    items: [
                        { label: 'Usuários', icon: 'pi pi-fw pi-cog', to: '/users' },
                        { label: 'Transportes', icon: 'pi pi-fw pi-car', to: '/transport' },
                        { label: 'Despesas', icon: 'pi pi-fw pi-tags', to: '/expenses' },
                        { label: 'Parâmetro KM', icon: 'pi pi-fw pi-wrench', to: '/parameterKm' },
                        
                    ]
                },
                
            ]
            : [])
        
    ];

    return (
        <MenuProvider>
            <ul className="layout-menu">
                {model.map((item, i) => {
                    return !item?.seperator ? <AppMenuitem item={item} root={true} index={i} key={item.label} /> : <li className="menu-separator"></li>;
                })}
            </ul>
        </MenuProvider>
    );
};

export default AppMenu;
