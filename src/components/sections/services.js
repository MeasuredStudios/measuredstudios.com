import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Img from 'gatsby-image';
import { motion, useAnimation } from 'framer-motion';

import { detectMobileAndTablet, isSSR } from '../../utils';
import { useOnScreen } from '../../hooks';
import ContentWrapper from '../../styles/contentWrapper';
import Button from '../../styles/button';

const StyledSection = styled.section`
  width: 100%;
  height: auto;
  background: ${({ theme }) => theme.colors.background};
  margin-top: 6rem;
`;

const StyledContentWrapper = styled(ContentWrapper)`
  && {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-right: 0;
    padding-left: 0;
    @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
      padding-right: 2.5rem;
      padding-left: 2.5rem;
    }
    .section-title {
      padding-right: 2.5rem;
      padding-left: 2.5rem;
      @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
        padding-right: 0;
        padding-left: 0;
      }
    }
  }
`;

const StyledServices = styled.div`
  display: grid;
  /* Calculate how many columns are needed, depending on services count */
  grid-template-columns: repeat(
    ${({ itemCount }) => Math.ceil(itemCount / 2)},
    15.625rem
  );
  grid-template-rows: repeat(2, auto);
  grid-auto-flow: column;
  column-gap: 1rem;
  row-gap: 1rem;
  padding: 0 2.5rem 1.25rem 2.5rem;
  overflow-x: scroll;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar {
    display: none;
  }
  /* Workaround: https://stackoverflow.com/questions/38993170/last-margin-padding-collapsing-in-flexbox-grid-layout */
  &::after {
    content: '';
    width: ${({ itemCount }) =>
      Math.ceil(itemCount / 2) % 2 === 1 ? '17.125rem' : '2.5rem'};
  }
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-auto-flow: row;
    grid-template-columns: repeat(3, 15.625rem);
    overflow: visible;
    padding: 0;
  }
  /* Show scrollbar if desktop and wrapper width > viewport width */
  @media (hover: hover) {
    scrollbar-color: ${({ theme }) => theme.colors.scrollBar} transparent; // Firefox only
    &::-webkit-scrollbar {
      display: block;
      -webkit-appearance: none;
    }

    &::-webkit-scrollbar:horizontal {
      height: 0.8rem;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 8px;
      border: 0.2rem solid ${({ theme }) => theme.colors.background};
      background-color: ${({ theme }) => theme.colors.scrollBar};
    }

    &::-webkit-scrollbar-track {
      background-color: ${({ theme }) => theme.colors.background};
      border-radius: 8px;
    }
  }

  .services {
    width: 15.625rem;
    height: 3rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 1rem;
    border: 0.125rem solid ${({ theme }) => theme.colors.primary};
    border-radius: ${({ theme }) => theme.borderRadius};
    background: ${({ theme }) => theme.colors.card};
    .icon {
      margin-right: 0.5rem;
    }
  }
`;

const Services = ({ content }) => {
  const { exports, frontmatter } = content[0].node;
  const { shownItems, services } = exports;

  const [shownServices, setShownServices] = useState(shownItems);

  const ref = useRef();
  const onScreen = useOnScreen(ref);

  const iControls = useAnimation();
  const bControls = useAnimation();

  useEffect(() => {
    // If mobile or tablet, show all services initially
    // Otherwise services.mdx will determine how many services are shown
    // (isSSR) is used to prevent error during gatsby build
    if (!isSSR && detectMobileAndTablet(window.innerWidth)) {
      setShownServices(services.length);
    }
  }, [services]);

  useEffect(() => {
    const sequence = async () => {
      if (onScreen) {
        // i receives the value of the custom prop - can be used to stagger
        // the animation of each "interest" element
        await iControls.start((i) => ({
          opacity: 1,
          scaleY: 1,
          transition: { delay: i * 0.1 },
        }));
        await bControls.start({ opacity: 1, scaleY: 1 });
      }
    };
    sequence();
  }, [onScreen, shownServices, iControls, bControls]);

  const showMoreItems = () => setShownServices(shownServices + 4);

  return (
    <StyledSection id="services">
      <StyledContentWrapper>
        <h3 className="section-title">{frontmatter.title}</h3>
        <StyledServices itemCount={services.length} ref={ref}>
          {services.slice(0, shownServices).map(({ name, icon }, key) => (
            <motion.div
              className="services"
              key={key}
              custom={key}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={iControls}
            >
              <Img className="icon" fixed={icon.childImageSharp.fixed} /> {name}
            </motion.div>
          ))}
          {shownServices < services.length && (
            <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={bControls}>
              <Button
                onClick={() => showMoreItems()}
                type="button"
                textAlign="left"
              >
                + Load more
              </Button>
            </motion.div>
          )}
        </StyledServices>
      </StyledContentWrapper>
    </StyledSection>
  );
};

Services.propTypes = {
  content: PropTypes.arrayOf(
    PropTypes.shape({
      node: PropTypes.shape({
        exports: PropTypes.shape({
          services: PropTypes.array.isRequired,
          shownItems: PropTypes.number.isRequired,
        }).isRequired,
        frontmatter: PropTypes.object.isRequired,
      }).isRequired,
    }).isRequired
  ).isRequired,
};

export default Services;
