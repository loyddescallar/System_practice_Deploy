import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
export default function TroubleshootIssue() {
  const { modelId } = useParams();
  const navigate = useNavigate();
  useEffect(() => { navigate('/troubleshoot/' + modelId, { replace: true }); }, [modelId]);
  return null;
}
