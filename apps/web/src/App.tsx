import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AccountsListPage } from './pages/crm/AccountsListPage';
import { AccountDetailPage } from './pages/crm/AccountDetailPage';
import { ContactsListPage } from './pages/crm/ContactsListPage';
import { ContactDetailPage } from './pages/crm/ContactDetailPage';
import { DealsListPage } from './pages/crm/DealsListPage';
import { DealDetailPage } from './pages/crm/DealDetailPage';
import { ActivitiesListPage } from './pages/crm/ActivitiesListPage';
import { InvoicesListPage } from './pages/erp/InvoicesListPage';
import { InvoiceDetailPage } from './pages/erp/InvoiceDetailPage';
import { CustomersListPage } from './pages/erp/CustomersListPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/accounts"
          element={
            <ProtectedRoute>
              <Layout>
                <AccountsListPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/accounts/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <AccountDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/contacts"
          element={
            <ProtectedRoute>
              <Layout>
                <ContactsListPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/contacts/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ContactDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/deals"
          element={
            <ProtectedRoute>
              <Layout>
                <DealsListPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/deals/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <DealDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crm/activities"
          element={
            <ProtectedRoute>
              <Layout>
                <ActivitiesListPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/invoices"
          element={
            <ProtectedRoute>
              <Layout>
                <InvoicesListPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/invoices/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <InvoiceDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/erp/customers"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomersListPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
