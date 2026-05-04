import { useNavigate } from 'react-router-dom';

import PageHeader from '../../components/ui/PageHeader.jsx';
import AdminJobForm from './AdminJobForm.jsx';

const AdminJobFormPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Work orders"
        title="Create job"
        description="Create a work order, link it to a client property, and assign an operative."
      />
      <AdminJobForm
        onCancel={() => navigate('/admin/jobs')}
        onSaved={() => navigate('/admin/jobs')}
      />
    </div>
  );
};

export default AdminJobFormPage;
