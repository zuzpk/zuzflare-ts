"use client"
import { Box, Text } from '@zuzjs/ui';
import React from 'react';

const Page : React.FC = (_props) => {
    return <Box as={`w:100`}>
       <Text>Authenticated User</Text>
    </Box>
}

export default Page;