"use client"
import { Button, Crumb, CrumbItem, Flex, Icon, Spinner, Text } from '@zuzjs/ui';
import React, { useEffect } from 'react';

const PageTitle : React.FC<{
    loading?: boolean;
    icon?: string;
    title: string;
    message?: string;
    crumb?: CrumbItem[],
    actions?: {
        label: string;
        onClick: () => void;
    }[]
}> = ({
    loading,
    icon,
    title,
    message,
    crumb,
    actions
}) => {

    useEffect(() => {
        const oldTitle = document.title;
        document.title = title;
        return () => {
            document.title = oldTitle;
        }
    }, [])

    useEffect(() => {}, [icon, title, message, crumb, actions])

    return <Flex aic gap={10}>
        <Flex aic jcc as={`border:1,$neutral,solid ratio:1/1 w:50 r:half bg:$accent ass`}>
            { loading ? <Spinner />  : <Icon name={icon ?? `ship`} as={`s:xl`} /> }
        </Flex>
        <Flex cols as={`flex:1`}>
            <Text 
                tfx={`fog`}
                // hover={true}
                // repeat={false}
                as={`s:20 bold ${crumb ? `pl:6` : ``}`}>{title}</Text>
            <Text 
                tfx={`typewriter`}
                as={`s:16 opacity:0.5 ${crumb ? `pl:6` : ``}`}>{message ?? `...`}</Text>
            { crumb && <Crumb items={crumb} /> }
        </Flex>
        { actions && <Flex aic jce>
            {actions.map((a, i) => <Button 
                onClick={a.onClick}    
                key={`pt-action-${i}-${a.label}`}>{a.label}</Button>)}
        </Flex> }
    </Flex>
}

export default PageTitle;