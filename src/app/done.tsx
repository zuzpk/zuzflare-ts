import { Box, Button, Group, Icon, Text } from '@zuzjs/ui';
import React from 'react';

type DoneProps = {
    type: `error` | `success`,
    title?: string | string[],
    message?: string | string[],
    action?: {
        label: string,
        onClick: () => void
    }
}

const Done : React.FC<DoneProps> = ({ type, title, message, action }) => {

    return <Group as={`w:500 p:20 r:$radius flex aic jcc cols`}>
        <Icon 
            name={type == `error` ? `lamp-charge` : `taskboard-logo`} 
            as={[
                `s:3xl mb:10`,
            ]} />
        { Array.isArray(title) ? <>{title?.map((m, i) => <Text key={`done-title-${i}`} as={`s:lg bold`}>{m}</Text>)}</>
                : <Text key={`done-title-default`} as={`s:lg bold`}>{title || `Good Job`}</Text>}

        { Array.isArray(message) ? <>{message?.map((m, i) => <Text key={`done-msg-${i}`} as={`s:sm`}>{m}</Text>)}</>
                : <Text key={`done-msg-main`} as={`s:sm`}>{message || `That was easy. You did it :)`}</Text>}

        {action && <Box as={`mt:25`}>
            <Button onClick={() => {
                action.onClick?.()
            }} as={`bold`}>{action?.label ?? `Re-try`}</Button>
        </Box>}
    
    </Group>
}

export default Done;