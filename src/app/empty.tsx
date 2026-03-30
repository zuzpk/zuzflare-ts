"use client"
import { _ } from '@zuzjs/core';
import { Button, Flex, Icon, Text } from '@zuzjs/ui';
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
    return <Flex aic jcc cols as={`p:50`}>
        <Icon name={icon ?? 'empty'} as={`s:48 mb:20 c:$manatee-700`} />
        <Text as={`s:18 bold c:$manatee-700`}>{title}</Text>
        {message ? 
            _(message).isArray() ? 
                (message as string[]).map((m, i) => <Text as={`s:15 c:$manatee-600`} key={`msg-${i}-${m.replace(/\s+/g, '-')}`}>{m}</Text>)
                : <Text as={`s:15 c:$manatee-600`}>{message}</Text>
                    : null}
        {actions && actions.length > 0 && (
            <Flex as={`gap:10 mt:20`}>
                {actions.map((action, i) => (
                    <Button key={`action-${i}-${action.label}`} onClick={action.onClick} as={`gap:5`}>
                        {action.icon && <Icon name={action.icon} />}
                        {action.label}
                    </Button>
                ))}
            </Flex>
        )}

    </Flex>
}

export default Empty;