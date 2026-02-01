
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  User as UserType, Branch, Equipment, TransferRequest, RepairRequest, 
  Notification, Language, Role, RequestStatus 
} from './types';
import { TRANSLATIONS } from './constants';
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  X, 
  ChevronRight, 
  Plus, 
  Package, 
  GitPullRequest, 
  Wrench, 
  Building2, 
  ShieldCheck, 
  Globe,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit2,
  Save,
  Info,
  Calendar,
  MessageSquare,
  User,
  ArrowRightLeft,
  FileText,
  History,
  Filter,
  Share2,
  MessageCircle,
  Lock
} from 'lucide-react';

// --- MOCK INITIAL DATA ---
const INITIAL_USERS: UserType[] = [
  { id: '1', username: 'Admin', password: '123', role: 'ADMIN', branchId: '0', contactNumber: '000', status: 'APPROVED' },
  { id: '2', username: 'Site Manager 1', password: '123', role: 'MANAGER', branchId: '1', contactNumber: '111', status: 'APPROVED' },
  { id: '3', username: 'Site Manager 2', password: '123', role: 'MANAGER', branchId: '2', contactNumber: '222', status: 'APPROVED' }
];

const INITIAL_BRANCHES: Branch[] = [
  { id: '1', name: 'Main HQ', code: 'HQ001', location: 'New York', managerId: '2' },
  { id: '2', name: 'Downtown Branch', code: 'DT002', location: 'Chicago', managerId: '3' },
];

const INITIAL_EQUIPMENT: Equipment[] = [
  { id: '1', type: 'Excavator', companyId: 'CAT-101', make: 'Caterpillar', model: '320D', serialNumber: 'SN-001', power: '200HP', branchId: '1', condition: 'Excellent', imageUrl: 'https://picsum.photos/seed/excavator/400/300' },
  { id: '2', type: 'Generator', companyId: 'GEN-505', make: 'Honda', model: 'EU3000is', serialNumber: 'SN-002', power: '3kW', branchId: '1', condition: 'Good', imageUrl: 'https://picsum.photos/seed/generator/400/300' },
  { id: '3', type: 'Crane', companyId: 'CRN-202', make: 'Liebherr', model: 'LTM 1250', serialNumber: 'SN-003', power: '500HP', branchId: '2', condition: 'New', imageUrl: 'https://picsum.photos/seed/crane/400/300' },
];

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [lang, setLang] = useState<Language>('EN');
  const [users, setUsers] = useState<UserType[]>(INITIAL_USERS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [equipment, setEquipment] = useState<Equipment[]>(INITIAL_EQUIPMENT);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  // Modal State
  const [selectedEntity, setSelectedEntity] = useState<{ type: 'EQUIPMENT' | 'BRANCH' | 'USER', data: any } | null>(null);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [isAddRepairOpen, setIsAddRepairOpen] = useState(false);
  const [isAddTransferOpen, setIsAddTransferOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [preSelectedEquipmentId, setPreSelectedEquipmentId] = useState<string | null>(null);

  // Translation Helper
  const t = useCallback((key: string) => {
    return TRANSLATIONS[lang][key] || key;
  }, [lang]);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isManager = currentUser?.role === 'MANAGER';

  // Stats
  const stats = useMemo(() => ({
    totalBranches: branches.length,
    totalEquipment: equipment.length,
    pendingUsers: users.filter(u => u.status === 'PENDING').length,
    pendingTransfers: transfers.filter(t => t.status === 'PENDING').length,
    pendingRepairs: repairs.filter(r => r.status === 'PENDING').length,
  }), [branches, equipment, users, transfers, repairs]);

  // Actions
  const handleLogin = (username: string, pass: string) => {
    const user = users.find(u => u.username === username && u.password === pass);
    if (user) {
      if (user.status !== 'APPROVED') {
        alert("Account pending approval from Admin");
        return;
      }
      setCurrentUser(user);
    } else {
      alert("Invalid credentials");
    }
  };

  const handleRegister = (newUser: Partial<UserType>) => {
    const user: UserType = {
      id: Math.random().toString(36).substr(2, 9),
      username: newUser.username || '',
      password: newUser.password || '123',
      role: newUser.role || 'MANAGER',
      branchId: newUser.branchId || '1',
      email: newUser.email,
      contactNumber: newUser.contactNumber || '',
      status: 'PENDING',
    };
    setUsers([...users, user]);
    
    const adminNotif: Notification = {
      id: Date.now().toString(),
      userId: '1',
      title: t('userApprovalNeeded'),
      message: `${user.username} has requested access.`,
      link: 'ADMIN_PANEL',
      read: false,
      timestamp: Date.now()
    };
    setNotifications(prev => [adminNotif, ...prev]);
    setIsLoginView(true);
    alert("Request sent for approval!");
  };

  const addBranch = (newBranch: Partial<Branch>) => {
    const branch: Branch = {
      id: Math.random().toString(36).substr(2, 9),
      name: newBranch.name || '',
      code: newBranch.code || '',
      location: newBranch.location || '',
      managerId: newBranch.managerId || '',
    };
    setBranches([...branches, branch]);
    setIsAddBranchOpen(false);
  };

  const updateBranch = (updated: Branch) => {
    setBranches(branches.map(b => b.id === updated.id ? updated : b));
    setSelectedEntity(null);
  };

  const addEquipment = (newItem: Partial<Equipment>) => {
    const item: Equipment = {
      id: Math.random().toString(36).substr(2, 9),
      type: newItem.type || '',
      companyId: newItem.companyId || '',
      make: newItem.make || '',
      model: newItem.model || '',
      serialNumber: newItem.serialNumber || '',
      power: newItem.power || '',
      branchId: newItem.branchId || '1',
      condition: newItem.condition || 'New',
      imageUrl: newItem.imageUrl || `https://picsum.photos/seed/${Math.random()}/400/300`,
    };
    setEquipment([...equipment, item]);
    setIsAddEquipmentOpen(false);
  };

  const updateEquipment = (updated: Equipment) => {
    setEquipment(equipment.map(e => e.id === updated.id ? updated : e));
    setSelectedEntity(null);
  };

  const deleteUser = (id: string) => {
    if (id === '1') {
      alert("System Admin cannot be deleted");
      return;
    }
    if (id === currentUser?.id) {
        alert("You cannot delete your own account while logged in.");
        return;
    }
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const updateUser = (updated: UserType) => {
    setUsers(users.map(u => u.id === updated.id ? updated : u));
    setSelectedEntity(null);
  };

  const handlePasswordUpdate = (newPass: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, password: newPass };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setIsChangePasswordOpen(false);
    alert(t('passwordUpdated'));
  };

  const requestTransfer = (transfer: Partial<TransferRequest>) => {
    const item = equipment.find(e => e.id === transfer.equipmentId);
    if (!item) return;

    const newRequest: TransferRequest = {
      id: Math.random().toString(36).substr(2, 9),
      equipmentId: transfer.equipmentId!,
      sourceBranchId: item.branchId,
      targetBranchId: transfer.targetBranchId!,
      reason: transfer.reason || '',
      status: 'PENDING',
      timestamp: Date.now()
    };
    setTransfers([...transfers, newRequest]);
    
    const targetBranch = branches.find(b => b.id === transfer.targetBranchId);
    if (targetBranch) {
      const managerNotif: Notification = {
        id: Date.now().toString(),
        userId: targetBranch.managerId,
        title: t('transferAction'),
        message: `Equipment transfer request from ${branches.find(b => b.id === item.branchId)?.name}`,
        link: 'TRANSFER',
        read: false,
        timestamp: Date.now()
      };
      setNotifications(prev => [managerNotif, ...prev]);
    }
    setIsAddTransferOpen(false);
  };

  const processTransfer = (requestId: string, status: RequestStatus, reason?: string) => {
    setTransfers(transfers.map(tr => {
      if (tr.id === requestId) {
        if (status === 'APPROVED') {
          setEquipment(equipment.map(e => e.id === tr.equipmentId ? { ...e, branchId: tr.targetBranchId } : e));
        }
        return { ...tr, status, rejectionReason: reason };
      }
      return tr;
    }));
  };

  const requestRepair = (equipmentId: string, targetBranchId: string, faults: string[], remarks: string) => {
    const item = equipment.find(e => e.id === equipmentId);
    const req: RepairRequest = {
      id: Math.random().toString(36).substr(2, 9),
      equipmentId,
      branchId: item?.branchId || currentUser?.branchId!,
      targetBranchId,
      faults,
      remarks,
      status: 'PENDING',
      timestamp: Date.now()
    };
    setRepairs([...repairs, req]);
    const adminNotif: Notification = {
      id: Date.now().toString(),
      userId: '1',
      title: t('repairRequestSent'),
      message: `Repair needed for equipment in ${branches.find(b => b.id === req.branchId)?.name}`,
      link: 'REPAIRS',
      read: false,
      timestamp: Date.now()
    };
    setNotifications(prev => [adminNotif, ...prev]);
    setIsAddRepairOpen(false);
  };

  const handleNotificationClick = (link: string, id: string) => {
    setActiveTab(link);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleWhatsAppShare = (item: Equipment) => {
    const branchName = branches.find(b => b.id === item.branchId)?.name || 'Unknown';
    const message = `*EquipMaster - Equipment Info*\n\n` +
                    `*Type:* ${item.type}\n` +
                    `*Company ID:* ${item.companyId}\n` +
                    `*Make:* ${item.make}\n` +
                    `*Model:* ${item.model}\n` +
                    `*Serial No:* ${item.serialNumber}\n` +
                    `*Power:* ${item.power}\n` +
                    `*Branch:* ${branchName}\n` +
                    `*Condition:* ${item.condition}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const currentUserBranchName = branches.find(b => b.id === currentUser?.branchId)?.name || (isAdmin ? t('systemAdmin') : 'Unknown');

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 bg-slate-900 overflow-hidden relative`} dir={lang === 'AR' ? 'rtl' : 'ltr'}>
        <div className="absolute inset-0 z-0">
          <img src="https://picsum.photos/seed/industrial/1600/900" alt="Background" className="w-full h-full object-cover opacity-20 blur-sm" />
        </div>
        
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 relative z-10">
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Package className="text-white w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">EquipMaster</h1>
             </div>
             <button 
               onClick={() => setLang(lang === 'EN' ? 'AR' : 'EN')}
               className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
             >
               <Globe size={16} />
               {lang === 'EN' ? 'AR' : 'EN'}
             </button>
          </div>

          {isLoginView ? (
            <LoginForm t={t} users={users} onLogin={handleLogin} onSwitch={() => setIsLoginView(false)} />
          ) : (
            <RegisterForm t={t} branches={branches} onRegister={handleRegister} onSwitch={() => setIsLoginView(true)} onAddBranch={() => setIsAddBranchOpen(true)} />
          )}
        </div>
        {isAddBranchOpen && <AddBranchModal t={t} users={users} onClose={() => setIsAddBranchOpen(false)} onSubmit={addBranch} />}
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-gray-50`} dir={lang === 'AR' ? 'rtl' : 'ltr'}>
      <aside className={`fixed inset-y-0 ${lang === 'AR' ? 'right-0' : 'left-0'} z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : (lang === 'AR' ? 'translate-x-full' : '-translate-x-full')} lg:translate-x-0`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold">EquipMaster</span>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto">
            <NavItem active={activeTab === 'DASHBOARD'} onClick={() => setActiveTab('DASHBOARD')} icon={<LayoutDashboard size={20}/>} label={t('dashboard')} />
            <NavItem active={activeTab === 'EQUIPMENT'} onClick={() => setActiveTab('EQUIPMENT')} icon={<Package size={20}/>} label={t('equipment')} />
            <NavItem active={activeTab === 'BRANCHES'} onClick={() => setActiveTab('BRANCHES')} icon={<Building2 size={20}/>} label={t('branches')} />
            <NavItem active={activeTab === 'TRANSFER'} onClick={() => setActiveTab('TRANSFER')} icon={<GitPullRequest size={20}/>} label={t('transfer')} />
            <NavItem active={activeTab === 'REPAIRS'} onClick={() => setActiveTab('REPAIRS')} icon={<Wrench size={20}/>} label={t('repairs')} />
            {(isAdmin || isManager) && (
              <NavItem active={activeTab === 'REPORTS'} onClick={() => setActiveTab('REPORTS')} icon={<FileText size={20}/>} label={t('reports')} />
            )}
            {isAdmin && (
              <NavItem active={activeTab === 'ADMIN_PANEL'} onClick={() => setActiveTab('ADMIN_PANEL')} icon={<ShieldCheck size={20}/>} label={t('adminPanel')} />
            )}
          </nav>

          <div className="pt-6 border-t border-slate-800 space-y-2">
            <button 
              onClick={() => setIsChangePasswordOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Lock size={20} />
              {t('changePassword')}
            </button>
            <button 
              onClick={() => setLang(lang === 'EN' ? 'AR' : 'EN')}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Globe size={20} />
              {lang === 'EN' ? 'Arabic' : 'English'}
            </button>
            <button 
              onClick={() => setCurrentUser(null)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <LogOut size={20} />
              {t('logout')}
            </button>
          </div>
        </div>
      </aside>

      <main className={`flex-1 ${lang === 'AR' ? 'lg:mr-64' : 'lg:ml-64'}`}>
        <header className="bg-white border-b sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
          <button className="lg:hidden text-gray-500" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800 hidden md:block">
              {t(activeTab.toLowerCase())} - {currentUser.username} <span className="text-blue-600 font-bold">({currentUserBranchName})</span>
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
                <Bell size={20} />
                {notifications.filter(n => !n.read && (n.userId === currentUser.id || n.userId === '1')).length > 0 && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              <div className={`absolute ${lang === 'AR' ? 'left-0' : 'right-0'} mt-2 w-80 bg-white shadow-xl rounded-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50`}>
                <div className="p-4 border-b font-bold text-gray-700">{t('notifications')}</div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.filter(n => n.userId === currentUser.id || (isAdmin && n.userId === '1')).map(n => (
                    <div key={n.id} onClick={() => handleNotificationClick(n.link, n.id)} className={`p-4 border-b hover:bg-gray-50 cursor-pointer flex gap-3 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                      <div className="mt-1"><CheckCircle2 size={16} className="text-blue-500"/></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500">{n.message}</p>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>}
                </div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === 'DASHBOARD' && (
            <DashboardView 
              t={t} stats={stats} lang={lang} branches={branches} equipment={equipment} users={users}
              onTabChange={(tab: string) => setActiveTab(tab)}
              onEntityClick={(type: any, data: any) => setSelectedEntity({type, data})}
            />
          )}
          {activeTab === 'EQUIPMENT' && (
            <EquipmentView 
              t={t} items={equipment} branches={branches} 
              onAdd={() => setIsAddEquipmentOpen(true)} 
              onRequestRepair={(id: string) => { setPreSelectedEquipmentId(id); setIsAddRepairOpen(true); }}
              onRequestTransfer={(id: string) => { setPreSelectedEquipmentId(id); setIsAddTransferOpen(true); }}
              onEntityClick={(data: any) => setSelectedEntity({type: 'EQUIPMENT', data})}
              onWhatsAppShare={handleWhatsAppShare}
              isManager={currentUser.role === 'MANAGER' || isAdmin}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'BRANCHES' && (
            <BranchesView t={t} branches={branches} users={users} onAdd={() => setIsAddBranchOpen(true)} onEntityClick={(data: any) => setSelectedEntity({type: 'BRANCH', data})} isAdmin={isAdmin} />
          )}
          {activeTab === 'TRANSFER' && (
            <TransferView 
              t={t} transfers={transfers} equipment={equipment} branches={branches} currentUser={currentUser} 
              onSendRequest={() => setIsAddTransferOpen(true)} onProcess={processTransfer} onAddNewBranch={() => setIsAddBranchOpen(true)}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'REPAIRS' && (
            <RepairsView 
              t={t} repairs={repairs} equipment={equipment} branches={branches} currentUser={currentUser}
              isAdmin={isAdmin} onAdd={() => setIsAddRepairOpen(true)}
              onProcess={(id, status) => setRepairs(repairs.map(r => r.id === id ? { ...r, status } : r))} 
            />
          )}
          {activeTab === 'REPORTS' && (isAdmin || isManager) && (
            <ReportsView t={t} transfers={transfers} repairs={repairs} equipment={equipment} branches={branches} />
          )}
          {activeTab === 'ADMIN_PANEL' && isAdmin && (
            <AdminPanelView 
              t={t} users={users} branches={branches} transfers={transfers}
              onApprove={(id) => setUsers(users.map(u => u.id === id ? { ...u, status: 'APPROVED' } : u))} 
              onReject={(id) => setUsers(users.map(u => u.id === id ? { ...u, status: 'REJECTED' } : u))} 
              onEditUser={(u) => setSelectedEntity({type: 'USER', data: u})}
              onDeleteUser={deleteUser}
              onSendTransfer={() => setIsAddTransferOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedEntity && (
        <DetailModal t={t} entity={selectedEntity} branches={branches} users={users} isAdmin={isAdmin} onClose={() => setSelectedEntity(null)} 
          onSave={(data) => { 
            if (selectedEntity.type === 'EQUIPMENT') updateEquipment(data); 
            else if (selectedEntity.type === 'BRANCH') updateBranch(data);
            else if (selectedEntity.type === 'USER') updateUser(data);
          }}
        />
      )}

      {isChangePasswordOpen && <ChangePasswordModal t={t} currentUser={currentUser} onClose={() => setIsChangePasswordOpen(false)} onSubmit={handlePasswordUpdate} />}
      {isAddBranchOpen && <AddBranchModal t={t} users={users} onClose={() => setIsAddBranchOpen(false)} onSubmit={addBranch} />}
      {isAddEquipmentOpen && <AddEquipmentModal t={t} branches={branches} onClose={() => setIsAddEquipmentOpen(false)} onSubmit={addEquipment} onOpenAddBranch={() => setIsAddBranchOpen(true)} />}
      
      {isAddRepairOpen && (
        <AddRepairModal 
          t={t} equipment={equipment.filter(e => e.branchId === currentUser.branchId || isAdmin)} 
          branches={branches} initialEquipmentId={preSelectedEquipmentId}
          onClose={() => { setIsAddRepairOpen(false); setPreSelectedEquipmentId(null); }} 
          onSubmit={requestRepair} 
        />
      )}

      {isAddTransferOpen && (
        <AddTransferModal 
          t={t} equipment={equipment.filter(e => isAdmin || e.branchId === currentUser.branchId)} 
          branches={branches} initialEquipmentId={preSelectedEquipmentId}
          onClose={() => { setIsAddTransferOpen(false); setPreSelectedEquipmentId(null); }} 
          onSubmit={requestTransfer} 
        />
      )}
    </div>
  );
}

// --- Specific Sub-components ---

function DashboardView({ t, stats, lang, branches, equipment, users, onEntityClick, onTabChange }: any) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Building2 className="text-blue-600" />} label={t('totalBranches')} value={stats.totalBranches} color="blue" onClick={() => onTabChange('BRANCHES')} />
        <StatCard icon={<Package className="text-emerald-600" />} label={t('totalEquipment')} value={stats.totalEquipment} color="emerald" onClick={() => onTabChange('EQUIPMENT')} />
        <StatCard icon={<GitPullRequest className="text-amber-600" />} label={t('transfer')} value={stats.pendingTransfers} color="amber" onClick={() => onTabChange('TRANSFER')} />
        <StatCard icon={<Wrench className="text-rose-600" />} label={t('repairs')} value={stats.pendingRepairs} color="rose" onClick={() => onTabChange('REPAIRS')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{t('branches')}</h3>
            <button onClick={() => onTabChange('BRANCHES')} className="text-blue-600 font-bold text-sm hover:underline">{t('details')}</button>
          </div>
          <div className="space-y-4">
            {branches.slice(0, 3).map((branch: any) => {
              const manager = users.find((u: any) => u.id === branch.managerId);
              return (
                <div key={branch.id} onClick={() => onEntityClick('BRANCH', branch)} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                      {branch.code.substring(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{branch.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <User size={10}/> Manager: {manager?.username || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">{t('equipment')}</h3>
            <button onClick={() => onTabChange('EQUIPMENT')} className="text-blue-600 font-bold text-sm hover:underline">{t('details')}</button>
          </div>
          <div className="space-y-4">
            {equipment.slice(0, 3).map((item: any) => (
              <div key={item.id} onClick={() => onEntityClick('EQUIPMENT', item)} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <img src={item.imageUrl} alt={item.type} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold text-gray-800">{item.type}</p>
                    <p className="text-xs text-gray-400 font-medium">{item.companyId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.condition === 'New' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                     {item.condition}
                   </span>
                   <ChevronRight size={18} className="text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsView({ t, transfers, repairs, equipment, branches }: any) {
  const [filterBranchId, setFilterBranchId] = useState('ALL');

  const historyData = useMemo(() => {
    const combined = [
      ...transfers.map((tr: any) => ({ ...tr, type: 'TRANSFER' })),
      ...repairs.map((rp: any) => ({ ...rp, type: 'REPAIR' }))
    ];

    return combined
      .filter((item: any) => {
        if (filterBranchId === 'ALL') return true;
        if (item.type === 'TRANSFER') return item.sourceBranchId === filterBranchId || item.targetBranchId === filterBranchId;
        return item.branchId === filterBranchId || item.targetBranchId === filterBranchId;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [transfers, repairs, filterBranchId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 uppercase flex items-center gap-3">
            <History className="text-blue-600" /> {t('reports')}
          </h2>
          <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">{t('history')}</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border shadow-sm">
          <Filter size={18} className="text-blue-600" />
          <select 
            value={filterBranchId} 
            onChange={e => setFilterBranchId(e.target.value)}
            className="outline-none bg-transparent text-sm font-black text-gray-600"
          >
            <option value="ALL">{t('allBranches')}</option>
            {branches.map((b: Branch) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-8 py-5">{t('date')}</th>
                <th className="px-8 py-5">{t('equipment')}</th>
                <th className="px-8 py-5">{t('activity')}</th>
                <th className="px-8 py-5">{t('details')}</th>
                <th className="px-8 py-5">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {historyData.map((item: any) => {
                const equip = equipment.find((e: any) => e.id === item.equipmentId);
                const isTransfer = item.type === 'TRANSFER';
                const source = branches.find((b: any) => b.id === (isTransfer ? item.sourceBranchId : item.branchId));
                const target = branches.find((b: any) => b.id === item.targetBranchId);

                return (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 text-sm font-bold text-gray-500 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          {equip?.imageUrl ? <img src={equip.imageUrl} className="w-full h-full object-cover rounded-lg" /> : <Package size={16} />}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm">{equip?.type || 'Deleted Equip'}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{equip?.companyId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase w-fit ${isTransfer ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                        {isTransfer ? <ArrowRightLeft size={12} /> : <Wrench size={12} />}
                        {t(item.type.toLowerCase())}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {isTransfer ? (
                        <p className="text-xs font-bold text-gray-600 flex items-center gap-2">
                          <span className="text-gray-400">{source?.name}</span>
                          <ChevronRight size={14} className="text-blue-500" />
                          <span className="text-blue-600">{target?.name}</span>
                        </p>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 uppercase">{t('faults')}: {item.faults?.length || 0}</p>
                          <div className="flex flex-wrap gap-1">
                            {item.faults?.slice(0, 2).map((f: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500 max-w-[80px] truncate">{f}</span>
                            ))}
                            {item.faults?.length > 2 && <span className="text-[9px] font-bold text-gray-300">+{item.faults.length - 2}</span>}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${item.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {t(item.status.toLowerCase())}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {historyData.length === 0 && (
                <tr><td colSpan={5} className="p-12 text-center text-gray-400 font-bold uppercase tracking-widest">{t('noHistoryFound')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EquipmentView({ t, items, branches, onAdd, onRequestRepair, onRequestTransfer, onEntityClick, onWhatsAppShare, isManager, isAdmin }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{t('equipment')}</h2>
        {isAdmin && (
          <button onClick={onAdd} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
            <Plus size={20} /> {t('addNew')}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item: Equipment) => (
          <div key={item.id} className="bg-white rounded-3xl border shadow-sm overflow-hidden group hover:shadow-xl transition-all cursor-pointer relative" onClick={() => onEntityClick(item)}>
            <div className="h-52 relative overflow-hidden">
              <img src={item.imageUrl} alt={item.type} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-1.5 rounded-2xl text-xs font-black text-blue-600 shadow-xl border border-white">
                {item.condition}
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); onWhatsAppShare(item); }}
                className="absolute bottom-4 right-4 bg-emerald-500 text-white p-2.5 rounded-2xl shadow-lg hover:bg-emerald-600 transition-colors z-10 flex items-center gap-2"
                title="Share on WhatsApp"
              >
                <MessageCircle size={20} />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-black text-gray-800">{item.type}</h3>
              <p className="text-sm font-medium text-gray-400 mb-4">{item.companyId}</p>
              
              <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mb-4">
                <Building2 size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-gray-600">{branches.find((b: Branch) => b.id === item.branchId)?.name}</span>
              </div>

              {isManager && (
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRequestRepair(item.id); }} 
                    className="py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Wrench size={18} /> {t('repairs')}
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRequestTransfer(item.id); }} 
                    className="py-3 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <ArrowRightLeft size={18} /> {t('transfer')}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BranchesView({ t, branches, users, onAdd, onEntityClick, isAdmin }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">{t('branches')}</h2>{isAdmin && <button onClick={onAdd} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"><Plus size={20} /> {t('addNew')}</button>}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {branches.map((b: Branch) => {
          const manager = users.find((u: any) => u.id === b.managerId);
          return (
            <div key={b.id} onClick={() => onEntityClick(b)} className="bg-white p-8 rounded-3xl border shadow-sm flex items-start gap-6 hover:shadow-xl transition-all cursor-pointer group">
              <div className="p-5 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all"><Building2 size={28} /></div>
              <div><h3 className="text-xl font-black text-gray-800 mb-1">{b.name}</h3><p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-4">{b.code}</p><div className="space-y-2 text-sm text-gray-500 font-medium"><p className="flex items-center gap-2"><Globe size={14} className="text-gray-300" /> {b.location}</p><div className="flex items-center gap-2 text-blue-600 font-black pt-2"><User size={14} className="text-blue-400" /> <span>Manager: {manager?.username || 'No Manager assigned'}</span></div></div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailModal({ t, entity, branches, users, isAdmin, onClose, onSave }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...entity.data});

  const handleChange = (e: any) => setFormData({...formData, [e.target.name]: e.target.value});

  const fields = useMemo(() => {
    if (entity.type === 'USER') {
      return [
        { key: 'username', label: t('username'), type: 'text' },
        { key: 'role', label: t('role'), type: 'select', options: ['ADMIN', 'MANAGER', 'OPERATOR', 'USER'] },
        { key: 'branchId', label: t('branch'), type: 'select', options: branches.map((b: any) => ({ value: b.id, label: b.name })) },
        { key: 'contactNumber', label: t('contactNumber'), type: 'text' },
        { key: 'email', label: t('email'), type: 'text' },
        { key: 'status', label: t('status'), type: 'select', options: ['PENDING', 'APPROVED', 'REJECTED'] }
      ];
    }
    return Object.keys(formData)
      .filter(key => !['id', 'imageUrl', 'managerId', 'faults', 'targetBranchId', 'remarks'].includes(key))
      .map(key => ({ key, label: t(key) || key, type: key === 'branchId' ? 'select' : 'text' }));
  }, [entity, branches, t, formData]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Info className="text-blue-600" size={24} />
            {t('details')}: {entity.type === 'USER' ? formData.username : (entity.type === 'EQUIPMENT' ? formData.type : formData.name)}
          </h3>
          <div className="flex gap-2">
            {isAdmin && !isEditing && <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold"><Edit2 size={16} /> {t('edit')}</button>}
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X size={24} /></button>
          </div>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {entity.type === 'EQUIPMENT' && formData.imageUrl && <img src={formData.imageUrl} className="w-full h-48 object-cover rounded-2xl mb-6 shadow-sm border" alt="Equipment" />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{field.label}</label>
                {isEditing ? (
                  field.type === 'select' ? (
                    <select name={field.key} value={formData[field.key]} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
                      {field.options ? (
                         field.options.map((opt: any) => (
                           <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.label}>
                             {typeof opt === 'string' ? opt : opt.label}
                           </option>
                         ))
                      ) : (
                        branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)
                      )}
                    </select>
                  ) : (
                    <input name={field.key} value={formData[field.key]} onChange={handleChange} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
                  )
                ) : (
                  <p className="text-gray-800 font-medium py-1 px-2 bg-gray-50 rounded-lg border border-transparent truncate">
                    {field.key === 'branchId' ? (branches.find((b:any) => b.id === formData[field.key])?.name || formData[field.key]) : formData[field.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
        {isEditing && <div className="p-6 bg-gray-50 border-t flex gap-4"><button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-bold hover:bg-gray-100 transition-all">{t('cancel')}</button><button onClick={() => onSave(formData)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><Save size={18} /> {t('save')}</button></div>}
      </div>
    </div>
  );
}

function ChangePasswordModal({ t, currentUser, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.oldPassword !== currentUser.password) {
      setError(t('wrongOldPassword'));
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }
    onSubmit(formData.newPassword);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <h3 className="text-2xl font-black mb-6 uppercase tracking-tight flex items-center gap-3">
          <Lock className="text-blue-600" /> {t('changePassword')}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('oldPassword')}</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              onChange={e => setFormData({ ...formData, oldPassword: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('newPassword')}</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('confirmPassword')}</label>
            <input 
              type="password" 
              required
              className="w-full px-5 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>
          {error && <p className="text-rose-500 text-xs font-bold">{error}</p>}
          <div className="flex gap-4 mt-8 pt-4 border-t">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-all">{t('cancel')}</button>
            <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">{t('submit')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminPanelView({ t, users, branches, transfers, onApprove, onReject, onEditUser, onDeleteUser, onSendTransfer }: any) {
  return (
    <div className="space-y-12">
      <section>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-800 flex items-center gap-3 uppercase"><ShieldCheck size={28} className="text-amber-500" /> Pending Approval</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.filter((u:any) => u.status === 'PENDING').map((user: UserType) => (
            <div key={user.id} className="bg-white p-8 rounded-3xl border shadow-lg shadow-amber-500/5 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-black text-xl">{user.username.charAt(0)}</div>
                <div className="flex gap-2">
                  <button onClick={() => onReject(user.id)} className="p-2 text-amber-600 hover:bg-amber-100 rounded-xl transition-all" title="Reject"><XCircle size={22} /></button>
                  <button onClick={() => onApprove(user.id)} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg" title="Approve"><CheckCircle2 size={22} /></button>
                </div>
              </div>
              <h4 className="font-black text-gray-800 text-xl mb-1">{user.username}</h4>
              <p className="text-[10px] font-black text-gray-400 uppercase mb-4 flex items-center gap-2">
                <Building2 size={12}/> Branch: {branches.find((b: any) => b.id === user.branchId)?.name || 'Central'}
              </p>
              
              <div className="flex gap-2 pt-4 border-t border-gray-50">
                  <button onClick={() => onEditUser(user)} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all uppercase tracking-widest"><Edit2 size={12}/> Edit</button>
                  <button onClick={() => onDeleteUser(user.id)} className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-black bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all uppercase tracking-widest"><Trash2 size={12}/> Delete</button>
              </div>
            </div>
          ))}
          {users.filter((u:any) => u.status === 'PENDING').length === 0 && <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase border border-dashed rounded-3xl">No users awaiting approval</div>}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <section>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-gray-800 uppercase flex items-center gap-3"><User size={24} className="text-blue-600" /> User Directory</h3>
          </div>
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-8 py-5">{t('username')}</th>
                  <th className="px-8 py-5">{t('role')}</th>
                  <th className="px-8 py-5">{t('branch')}</th>
                  <th className="px-8 py-5">{t('status')}</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.filter((u:any) => u.status !== 'PENDING').map((user: UserType) => (
                  <tr key={user.id} className="hover:bg-gray-50/50">
                    <td className="px-8 py-6 font-black text-gray-800">{user.username}</td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-500">{user.role}</td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-500">
                      {branches.find((b: any) => b.id === user.branchId)?.name || 'Central Admin'}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${user.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {t(user.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onEditUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl" title="Edit User"><Edit2 size={16}/></button>
                        <button onClick={() => onDeleteUser(user.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl" title="Delete User"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      
      <section>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-800 uppercase flex items-center gap-3"><ArrowRightLeft size={24} className="text-blue-600" /> Transfer Oversight</h3>
          <button onClick={onSendTransfer} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={16}/> {t('addNew')}</button>
        </div>
        <div className="space-y-4">
          {transfers.slice(-5).reverse().map((tr) => (
            <div key={tr.id} className="bg-white p-6 rounded-3xl border flex items-center justify-between gap-4 group hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ArrowRightLeft size={20}/></div>
                <div>
                  <p className="text-sm font-black text-gray-800">{t('transferRequest')}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    {branches.find(b => b.id === tr.sourceBranchId)?.name} → {branches.find(b => b.id === tr.targetBranchId)?.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${tr.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{tr.status}</span>
                 <span className="text-[10px] font-black text-gray-300">{new Date(tr.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {transfers.length === 0 && <div className="p-12 text-center text-gray-400 font-bold border border-dashed rounded-3xl">No transfers recorded</div>}
        </div>
      </section>
    </div>
  );
}

// Global NavItem / StatCard 

function NavItem({ active, onClick, icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 text-sm font-bold rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ icon, label, value, color = 'blue', onClick }: any) {
  const bgColors: any = { blue: 'bg-blue-50', emerald: 'bg-emerald-50', amber: 'bg-amber-50', rose: 'bg-rose-50' };
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4 group hover:shadow-lg transition-all ${onClick ? 'cursor-pointer hover:border-blue-200' : ''}`}
    >
      <div className={`p-4 rounded-2xl ${bgColors[color]} group-hover:scale-110 transition-transform`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-gray-800">{value}</p>
      </div>
    </div>
  );
}

// Login/Register components
function LoginForm({ t, users, onLogin, onSwitch }: any) {
  const [username, setUsername] = useState(users[0]?.username || '');
  const [password, setPassword] = useState('123');
  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }}>
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('selectUser')}</label>
        <select value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-700">
          {users.filter((u:any) => u.status === 'APPROVED').map((u: any) => <option key={u.id} value={u.username}>{u.username} ({t(u.role.toLowerCase())})</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('password')}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold" required />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transform hover:-translate-y-1 transition-all mt-6 uppercase tracking-widest">{t('login')}</button>
      <p className="text-center text-sm text-gray-400 mt-6 font-bold">New to the platform? <button type="button" onClick={onSwitch} className="text-blue-600 hover:underline ml-1">{t('createUser')}</button></p>
    </form>
  );
}

function RegisterForm({ t, branches, onRegister, onSwitch, onAddBranch }: any) {
  const [formData, setFormData] = useState({ username: '', password: '123', email: '', contactNumber: '', branchId: branches[0]?.id || '', role: 'MANAGER' as Role });
  
  const handleBranchSelect = (val: string) => {
      if (val === 'ADD_NEW') {
          onAddBranch();
          return;
      }
      setFormData({...formData, branchId: val});
  };

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onRegister(formData); }}>
      <input placeholder={t('username')} className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none font-bold" required onChange={e => setFormData({...formData, username: e.target.value})} />
      <input type="password" placeholder={t('createPassword')} value={formData.password} className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none font-bold" required onChange={e => setFormData({...formData, password: e.target.value})} />
      <select className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none font-bold" onChange={e => setFormData({...formData, role: e.target.value as Role})}>
        <option value="MANAGER">{t('manager')}</option>
        <option value="OPERATOR">{t('operator')}</option>
        <option value="USER">{t('user')}</option>
      </select>
      <select value={formData.branchId} className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none font-bold" onChange={e => handleBranchSelect(e.target.value)}>
        {branches.map((b: Branch) => <option key={b.id} value={b.id}>{b.name}</option>)}
        <option value="ADD_NEW" className="text-blue-600 font-bold">+ {t('addNewBranch')}</option>
      </select>
      <input type="email" placeholder={t('email')} className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none font-bold" onChange={e => setFormData({...formData, email: e.target.value})} />
      <input type="tel" placeholder={t('contactNumber')} className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none font-bold" required onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
      <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-2xl hover:bg-blue-700 transition-all uppercase tracking-widest">{t('submit')}</button>
      <button type="button" onClick={onSwitch} className="w-full text-xs text-gray-400 hover:underline uppercase tracking-tighter font-black">Back to Login</button>
    </form>
  );
}

function AddBranchModal({ t, users, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({ name: '', code: '', location: '', managerId: users[0]?.id || '' });
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl">
        <h3 className="text-2xl font-bold mb-6">{t('addNewBranch')}</h3>
        <div className="space-y-4">
          <input placeholder={t('branchName')} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input placeholder={t('branchCode')} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input placeholder={t('location')} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <select onChange={e => setFormData({...formData, managerId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none">
            {users.map((u:any) => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-all">{t('cancel')}</button>
          <button onClick={() => onSubmit(formData)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">{t('submit')}</button>
        </div>
      </div>
    </div>
  );
}

function AddEquipmentModal({ t, branches, onClose, onSubmit, onOpenAddBranch }: any) {
  const [formData, setFormData] = useState({ type: '', companyId: '', make: '', model: '', serialNumber: '', power: '', branchId: branches[0]?.id || '', condition: 'New' });
  const handleBranchChange = (val: string) => { if (val === 'ADD_NEW') { onOpenAddBranch(); return; } setFormData({...formData, branchId: val}); };
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        <h3 className="text-2xl font-bold mb-6">{t('addNewEquipment')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input placeholder={t('equipmentType')} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input placeholder={t('companyId')} onChange={e => setFormData({...formData, companyId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input placeholder={t('make')} onChange={e => setFormData({...formData, make: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input placeholder={t('model')} onChange={e => setFormData({...formData, model: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input placeholder={t('serialNumber')} onChange={e => setFormData({...formData, serialNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <input placeholder={t('power')} onChange={e => setFormData({...formData, power: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" />
          <select value={formData.branchId} onChange={e => handleBranchChange(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold">
            {branches.map((b:any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            <option value="ADD_NEW" className="text-blue-600 font-bold">+ {t('addNewBranch')}</option>
          </select>
          <select onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"><option value="New">New</option><option value="Excellent">Excellent</option><option value="Good">Good</option><option value="Repair Needed">Repair Needed</option></select>
        </div>
        <div className="flex gap-4 mt-8"><button onClick={onClose} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200 transition-all">{t('cancel')}</button><button onClick={() => onSubmit(formData)} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">{t('submit')}</button></div>
      </div>
    </div>
  );
}

function AddRepairModal({ t, equipment, branches, initialEquipmentId, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({ equipmentId: initialEquipmentId || '', targetBranchId: branches[0]?.id || '', faults: Array(10).fill(''), remarks: '' });
  const today = new Date().toLocaleDateString();
  const handleFaultChange = (index: number, value: string) => { const newFaults = [...formData.faults]; newFaults[index] = value; setFormData({...formData, faults: newFaults}); };
  const isFormValid = formData.equipmentId && formData.faults.some(f => f.trim() !== '');
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl overflow-y-auto max-h-[95vh]">
        <div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3"><Wrench className="text-blue-600" /> {t('addNewRepair')}</h3><button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button></div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('selectEquipment')}</label><select value={formData.equipmentId} onChange={e => setFormData({...formData, equipmentId: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700"><option value="">-- {t('selectEquipment')} --</option>{equipment.map((e: any) => <option key={e.id} value={e.id}>{e.type} ({e.companyId})</option>)}</select></div>
            <div className="space-y-1"><label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('date')}</label><div className="w-full px-4 py-3 rounded-xl border bg-gray-100 font-bold text-gray-500 flex items-center gap-3"><Calendar size={18} /> {today}</div></div>
          </div>
          <div className="space-y-1"><label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('targetBranch')}</label><select value={formData.targetBranchId} onChange={e => setFormData({...formData, targetBranchId: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700">{branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
          <div className="space-y-2"><label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('faults')} (min 1)</label><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{formData.faults.map((f, i) => (<div key={i} className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">{i+1}</span><input placeholder={t('faultPlaceholder')} value={f} onChange={e => handleFaultChange(i, e.target.value)} className="w-full pl-8 pr-4 py-2.5 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium" /></div>))}</div></div>
          <div className="space-y-1"><label className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('remarks')}</label><div className="relative"><MessageSquare size={16} className="absolute left-4 top-4 text-gray-300" /><textarea placeholder={t('remarks')} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-medium h-24 resize-none" /></div></div>
        </div>
        <div className="flex gap-4 mt-8 pt-6 border-t"><button onClick={onClose} className="flex-1 py-3.5 bg-gray-100 rounded-xl font-black hover:bg-gray-200 uppercase tracking-widest transition-all text-sm">{t('cancel')}</button><button disabled={!isFormValid} onClick={() => { const activeFaults = formData.faults.filter(f => f.trim() !== ''); onSubmit(formData.equipmentId, formData.targetBranchId, activeFaults, formData.remarks); }} className={`flex-1 py-3.5 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl text-sm ${!isFormValid ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'}`}>{t('submit')}</button></div>
      </div>
    </div>
  );
}

function AddTransferModal({ t, equipment, branches, initialEquipmentId, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({ equipmentId: initialEquipmentId || '', targetBranchId: '', reason: '' });
  
  // Logic: The target branch cannot be the current branch of the selected equipment
  const selectedEquip = equipment.find((e: Equipment) => e.id === formData.equipmentId);
  const targetBranches = branches.filter((b: Branch) => b.id !== selectedEquip?.branchId);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg p-10 shadow-2xl">
        <h3 className="text-2xl font-black mb-8">{t('transferRequest')}</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('selectEquipment')}</label>
            <select value={formData.equipmentId} className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:ring-4 outline-none font-bold" onChange={e => setFormData({...formData, equipmentId: e.target.value, targetBranchId: ''})}>
              <option value="">-- {t('selectEquipment')} --</option>
              {equipment.map((e: Equipment) => <option key={e.id} value={e.id}>{e.type} ({e.companyId})</option>)}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('targetBranch')}</label>
            <select value={formData.targetBranchId} className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:ring-4 outline-none font-bold" onChange={e => setFormData({...formData, targetBranchId: e.target.value})}>
              <option value="">-- {t('targetBranch')} --</option>
              {targetBranches.map((b: Branch) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>

          <textarea placeholder={t('reason')} className="w-full px-5 py-4 rounded-2xl border bg-gray-50 focus:ring-4 outline-none font-bold h-32 resize-none" onChange={e => setFormData({...formData, reason: e.target.value})} />
        </div>
        <div className="flex gap-4 mt-10"><button onClick={onClose} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black hover:bg-gray-200 transition-all uppercase">{t('cancel')}</button><button disabled={!formData.equipmentId || !formData.targetBranchId} onClick={() => onSubmit(formData)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 disabled:bg-gray-300 transition-all shadow-xl shadow-blue-600/30 uppercase">{t('submit')}</button></div>
      </div>
    </div>
  );
}

function RepairsView({ t, repairs, equipment, branches, isAdmin, currentUser, onAdd, onProcess }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-gray-800 uppercase">{t('repairs')}</h2>{(currentUser.role === 'MANAGER' || isAdmin) && (<button onClick={onAdd} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"><Plus size={20} /> {t('addNew')}</button>)}</div>
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b"><tr className="text-xs font-black text-gray-400 uppercase tracking-widest"><th className="px-8 py-5">{t('date')}</th><th className="px-8 py-5">{t('equipment')}</th><th className="px-8 py-5">{t('branch')}</th><th className="px-8 py-5">{t('targetBranch')}</th><th className="px-8 py-5">{t('faults')}</th><th className="px-8 py-5">{t('status')}</th>{isAdmin && <th className="px-8 py-5">Action</th>}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {repairs.map((r: RepairRequest) => {
              const item = equipment.find((e: Equipment) => e.id === r.equipmentId);
              const branch = branches.find((b: Branch) => b.id === r.branchId);
              const targetBranch = branches.find((b: Branch) => b.id === r.targetBranchId);
              return (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold text-gray-500">{new Date(r.timestamp).toLocaleDateString()}</td>
                  <td className="px-8 py-6 font-black text-gray-800">{item?.type}</td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-500">{branch?.name}</td>
                  <td className="px-8 py-6 text-sm font-bold text-gray-500">{targetBranch?.name}</td>
                  <td className="px-8 py-6"><div className="flex flex-wrap gap-1 max-w-xs">{r.faults.map((f, idx) => (<span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100 truncate max-w-[100px]">{f}</span>))}</div></td>
                  <td className="px-8 py-6"><span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${r.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{t(r.status.toLowerCase())}</span></td>
                  {isAdmin && r.status === 'PENDING' && (<td className="px-8 py-6"><button onClick={() => onProcess(r.id, 'APPROVED')} className="text-blue-600 hover:text-blue-800 font-black text-xs uppercase underline">Fix Equipment</button></td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransferView({ t, transfers, equipment, branches, currentUser, onSendRequest, onProcess, onAddNewBranch, isAdmin }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h2 className="text-2xl font-black text-gray-800 uppercase">{t('transfer')}</h2>{(currentUser.role === 'MANAGER' || isAdmin) && (<div className="flex gap-2"><button onClick={onAddNewBranch} className="bg-slate-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"><Building2 size={20} /> {t('addNewBranch')}</button><button onClick={onSendRequest} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"><Plus size={20} /> {t('transferRequest')}</button></div>)}</div>
      <div className="space-y-4">
        {transfers.length === 0 ? (<div className="bg-white p-12 text-center rounded-3xl border text-gray-400 font-bold uppercase tracking-widest">No transfer records found</div>) : (
          transfers.map((tr: TransferRequest) => {
            const item = equipment.find((e: Equipment) => e.id === tr.equipmentId);
            const targetB = branches.find((b: Branch) => b.id === tr.targetBranchId);
            const sourceB = branches.find((b: Branch) => b.id === tr.sourceBranchId);
            return (
              <div key={tr.id} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-4 items-center"><div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><GitPullRequest size={24} /></div><div><h4 className="font-black text-gray-800">{item?.type || 'Unknown'}</h4><p className="text-xs font-bold text-gray-400 uppercase">{sourceB?.name} → {targetB?.name}</p></div></div>
                <div className="px-4 border-l border-gray-100 hidden md:block flex-1"><p className="text-xs font-black text-gray-400 uppercase mb-1">{t('reason')}</p><p className="text-sm font-medium text-gray-600">{tr.reason}</p></div>
                <div className="flex items-center gap-4"><span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${tr.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : tr.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{t(tr.status.toLowerCase())}</span>{tr.status === 'PENDING' && (tr.targetBranchId === currentUser.branchId || isAdmin) && (<div className="flex gap-2"><button onClick={() => onProcess(tr.id, 'REJECTED', 'Actioned by admin/manager')} className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><XCircle size={22} /></button><button onClick={() => onProcess(tr.id, 'APPROVED')} className="p-2.5 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"><CheckCircle2 size={22} /></button></div>)}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
