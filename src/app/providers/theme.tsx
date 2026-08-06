"use client"
import { Flex, setZuzMap, SPINNER, ThemeProvider, TRANSITION_CURVES, TRANSITIONS, Variant } from '@zuzjs/ui';
import React, { ReactNode } from 'react';
import { zuzMap } from '../css/zuzmap';
import PushHandler from '../push-handler';

setZuzMap(zuzMap)

const AppThemeProvider : React.FC<{ children: ReactNode }> = ({ children }) => {
    return <ThemeProvider
      zuzMap={zuzMap}
      variant={Variant.Medium}
      group={{
        fx: {
            duration: 0.5,
            transition: TRANSITIONS.SlideInBottom,
            curve: TRANSITION_CURVES.Liquid
        },
        fxStep: 0.1,
        fxDelay: 0.1
      }}
      spinner={{
        type: SPINNER.Roller
      }}
      tooltip={{
        transition: `scale`
      }}
      toast={{
        curve: TRANSITION_CURVES.Spring
      }}
      drawer={{
        margin: 20,
        speed: .3
      }}
      dialog={{
        transition: TRANSITIONS.SlideInBottom,
        curve: TRANSITION_CURVES.Spring,
        // curve: TRANSITION_CURVES.Bounce,
        speed: 1,
        titleAlignment: `left`  
      }}
      squircle={true}>
        <Flex cols as={`app minH:100vh`}>
          <PushHandler />
          {children}
        </Flex>
    </ThemeProvider>

}

export default AppThemeProvider;