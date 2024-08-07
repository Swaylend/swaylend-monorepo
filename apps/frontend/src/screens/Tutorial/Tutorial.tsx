import Layout from '@components/Layout';
import SizedBox from '@components/SizedBox';
import tutorials from '@src/constants/tutorials';
import type React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Tutorial: React.FC = () => {
  const { tutorialId } = useParams<{ tutorialId: string }>();
  const tutorial = tutorials.find(({ id }) => id === tutorialId);
  const navigate = useNavigate();
  if (tutorial == null) navigate({ pathname: '/' });
  return (
    <Layout>
      <SizedBox height={24} />
      <iframe
        title="Tutorial form"
        src={tutorial?.link ?? ''}
        width="640"
        height="1779"
        frameBorder={0}
        marginHeight={0}
        marginWidth={0}
      >
        Loading...
      </iframe>
    </Layout>
  );
};

export default Tutorial;
