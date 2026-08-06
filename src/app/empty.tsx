"use client"
import { _ } from '@zuzjs/core';
import { Button, Flex, Group, Icon, Text, Variant } from '@zuzjs/ui';
import React from 'react';

const Empty : React.FC<{
    icon?: string,
    title?: string,
    message?: string | string[],
    actions?: {
        label: string;
        icon?: string;
        onClick: () => void;
    }[]
}> = ({
    title,
    message,
    icon,
    actions
}) => {
    return <Group as={`flex aic jcc cols p:50`}>
        
        <Icon name={icon ?? 'empty'} as={`s:48 mb:20`} />
        <Text as={`s:18 bold`}>{title}</Text>
        {message ? 
            _(message).isArray() ? 
                (message as string[]).map((m, i) => <Text as={`s:15`} key={`msg-${i}-${m.replace(/\s+/g, '-')}`}>{m}</Text>)
                : <Text as={`s:15`}>{message}</Text>
                    : null}
        {actions && actions.length > 0 && (
            <Flex as={`gap:10 mt:20`}>
                {actions.map((action, i) => (
                    <Button 
                        key={`action-${i}-${action.label}`} 
                        onClick={action.onClick} 
                        as={`gap:5`}
                        variant={Variant.Small}>
                        {action.icon && <Icon name={action.icon} />}
                        {action.label}
                    </Button>
                ))}
            </Flex>
        )}

    </Group>
}

export default Empty;