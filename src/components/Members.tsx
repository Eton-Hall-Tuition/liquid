import React from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Shield, 
  Phone, 
  Mail, 
  Upload,
  FileText,
  X,
  CreditCard,
  CheckCircle2,
  Trash2,
  Edit2,
  Camera,
  IdCard
} from 'lucide-react';
import { useStore, User } from '../store';
import { motion, AnimatePresence } from 'motion/react';
import { SectionAudit } from './SectionAudit';
import { cn } from '../lib/utils';

export function Members() {
  const { users, currentUser, deleteMember, settings } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [searchTerm, setSearchTerm] = React.useState('');
  const [modalMode, setModalMode] = React.useState<'add' | 'edit' | 'view' | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setModalMode('view');
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setModalMode('add');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">Members Hub</h2>
          <p className="text-slate-400 font-medium">Full organization registry and credential management</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-primary text-slate-950 px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-primary hover:scale-105 active:scale-95 transition-all text-xs uppercase"
        >
          <UserPlus className="w-5 h-5" />
          ADD MEMBER
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 glass flex items-center gap-3 px-6 py-4 rounded-2xl">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by name, email or designation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-white w-full font-medium placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="glass group rounded-[2.5rem] hover:border-primary/30 transition-all overflow-hidden bg-slate-500/5 p-8">
            <div className="flex justify-between items-start mb-8">
              <div className="relative">
                {user.photoUrl ? (
                  <img 
                    src={user.photoUrl} 
                    alt={user.name} 
                    className="w-16 h-16 rounded-[2rem] object-cover border-2 border-slate-500/20 shadow-xl"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-[2rem] bg-slate-500/10 border-2 border-slate-500/20 flex items-center justify-center text-xl font-black text-white shadow-xl">
                    {user.name[0]}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg flex items-center justify-center border-4 border-slate-900">
                  <Shield className="w-3 h-3 text-slate-950" />
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={cn(
                  "text-[10px] font-black uppercase px-3 py-1 rounded-full",
                  user.role === 'Super Admin' ? "bg-primary/10 text-primary" : "bg-slate-500/10 text-slate-500"
                )}>
                  {user.role}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleView(user)}
                    className="p-2 bg-slate-500/10 border border-slate-500/20 rounded-lg text-slate-500 hover:text-primary transition-colors"
                    title="View Identity Vault"
                  >
                    <FileText className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleEdit(user)}
                    className="p-2 bg-slate-500/10 border border-slate-500/20 rounded-lg text-slate-500 hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  {user.id !== '1' && (
                    <button 
                      onClick={async () => {
                        if (confirm('Are you sure you want to delete this member?')) {
                          await deleteMember(user.id);
                        }
                      }}
                      className="p-2 bg-slate-500/10 border border-slate-500/20 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-black text-white uppercase tracking-tight truncate">{user.name}</h3>
              <p className="text-xs font-bold text-slate-500 mt-1 tracking-widest uppercase truncate">{user.email}</p>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-500/10">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center border border-slate-500/20">
                  <Phone className="w-3 h-3" />
                </div>
                <span className="text-xs font-bold">{user.phone}</span>
              </div>
              {user.aadhaarUrl && (
                <div className="flex items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-500/60 font-black">IDENTITY VERIFIED</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modalMode && (
          <MemberModal 
            mode={modalMode as any}
            user={selectedUser}
            onClose={() => setModalMode(null)} 
          />
        )}
      </AnimatePresence>

      <SectionAudit module="Members" />
    </div>
  );
}

function MemberModal({ mode, user, onClose }: { mode: 'add' | 'edit' | 'view', user: User | null, onClose: () => void }) {
  const { addMember, updateMember, settings, uploadFile } = useStore();
  const primaryColor = settings?.primaryColor || '#22D3EE';
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'Sales' as any,
    phone: user?.phone || '',
    photoUrl: user?.photoUrl || '',
    aadhaarUrl: user?.aadhaarUrl || ''
  });
  
  const [activeStep, setActiveStep] = React.useState(mode === 'view' ? 2 : 1);
  const [uploading, setUploading] = React.useState({ photo: false, doc: false });
  const [errorStatus, setErrorStatus] = React.useState<string | null>(null);

  const isViewOnly = mode === 'view';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'doc') => {
    if (isViewOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setErrorStatus('File size exceeds 1MB limit');
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    setErrorStatus(null);

    try {
      const folder = formData.email.toLowerCase() || 'temp';
      const fileName = type === 'photo' ? 'profile_photo' : 'identity_doc';
      const path = `users/${folder}/${fileName}`;
      const url = await uploadFile(file, path);
      
      setFormData(prev => ({
        ...prev,
        [type === 'photo' ? 'photoUrl' : 'aadhaarUrl']: url
      }));
    } catch (err) {
      setErrorStatus('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewOnly) {
      onClose();
      return;
    }
    if (uploading.photo || uploading.doc) {
      setErrorStatus('Please wait for uploads to complete');
      return;
    }
    if (mode === 'add') {
      await addMember(formData);
    } else if (user) {
      await updateMember(user.id, formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass w-full max-w-2xl p-10 rounded-[3rem]"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-6">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all", activeStep >= 1 ? "bg-primary text-slate-950 shadow-primary" : "bg-slate-500/10")}>
              {activeStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '01'}
            </div>
            <div className="h-px w-8 bg-slate-500/20" />
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all", activeStep >= 2 ? "bg-primary text-slate-950 shadow-primary" : "bg-slate-500/10 border border-slate-500/20")}>
              02
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {errorStatus && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-black uppercase tracking-widest text-center">
            {errorStatus}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {activeStep === 1 ? (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">
                  {mode === 'add' ? 'Personnel Identity' : 'Update Credentials'}
                </h3>
                <p className="text-slate-400 font-medium normal-case">Primary contact and system permissions</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@organization.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 12345 67890"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Designation</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-colors font-medium appearance-none cursor-pointer text-white"
                  >
                    <option value="Admin" className="bg-slate-900">Admin</option>
                    <option value="Sales" className="bg-slate-900">Sales Professional</option>
                    <option value="Inventory Manager" className="bg-slate-900">Inventory Lead</option>
                    {mode === 'edit' && user?.role === 'Super Admin' && <option value="Super Admin" className="bg-slate-900">Super Admin</option>}
                  </select>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => {
                  if (!formData.name || !formData.email || !formData.phone) {
                    setErrorStatus('Please fill in all primary details first');
                    return;
                  }
                  setActiveStep(2);
                }}
                className="w-full bg-slate-500/5 border border-slate-500/10 text-primary font-black py-5 rounded-2xl hover:bg-slate-500/10 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3"
              >
                Proceed to Verification
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tight">Identity Vault</h3>
                <p className="text-slate-400 font-medium normal-case">
                  {isViewOnly ? `Viewing credentials for ${formData.name}` : 'Verify credentials with official documentation'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block w-full">Passport Photo</label>
                  <div className="relative group mx-auto">
                    <div className="w-32 h-32 mx-auto rounded-[2.5rem] bg-slate-500/5 border-2 border-dashed border-slate-500/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden relative">
                      {/* Under Update Overlay */}
                      <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                        <div className="bg-amber-500 text-slate-950 text-[6px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full shadow-lg border border-white/20 transform -rotate-12">
                          Under Update
                        </div>
                      </div>
                      {uploading.photo ? (
                        <div className="animate-pulse flex flex-col items-center gap-2">
                          <Camera className="w-8 h-8 text-primary" />
                          <span className="text-[8px] font-black text-primary uppercase">Uploading...</span>
                        </div>
                      ) : formData.photoUrl ? (
                        <>
                          <img src={formData.photoUrl} alt="Passport" className="w-full h-full object-cover" />
                          {isViewOnly && (
                            <a 
                              href={formData.photoUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                              <Search className="w-6 h-6 text-white" />
                            </a>
                          )}
                        </>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-slate-500" />
                          <span className="text-[8px] font-black text-slate-500 uppercase">
                            {isViewOnly ? 'No Photo' : 'Click to Upload'}
                          </span>
                        </>
                      )}
                      {!isViewOnly && (
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={e => handleFileChange(e, 'photo')}
                          disabled={uploading.photo}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-center block w-full">Identity Document</label>
                  <div className="relative group mx-auto">
                    <div className="w-32 h-32 mx-auto rounded-[2.5rem] bg-slate-500/5 border-2 border-dashed border-slate-500/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden relative">
                      {/* Under Update Overlay */}
                      <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                        <div className="bg-amber-500 text-slate-950 text-[6px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full shadow-lg border border-white/20 transform -rotate-12">
                          Under Update
                        </div>
                      </div>
                      {uploading.doc ? (
                        <div className="animate-pulse flex flex-col items-center gap-2">
                          <IdCard className="w-8 h-8 text-primary" />
                          <span className="text-[8px] font-black text-primary uppercase">Uploading...</span>
                        </div>
                      ) : formData.aadhaarUrl ? (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          <span className="text-[8px] font-black text-emerald-500 uppercase">Verified ID</span>
                          {isViewOnly ? (
                            <a 
                              href={formData.aadhaarUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-[8px] font-black text-primary uppercase hover:underline"
                            >
                              View Doc
                            </a>
                          ) : (
                            <span className="text-[6px] text-slate-500 truncate max-w-[80px]">Change Doc</span>
                          )}
                        </div>
                      ) : (
                        <>
                          <IdCard className="w-8 h-8 text-slate-500" />
                          <span className="text-[8px] font-black text-slate-500 uppercase">
                            {isViewOnly ? 'No Document' : 'Attach Aadhaar'}
                          </span>
                        </>
                      )}
                      {!isViewOnly && (
                        <input 
                          type="file" 
                          accept="image/*,application/pdf"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={e => handleFileChange(e, 'doc')}
                          disabled={uploading.doc}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {isViewOnly ? (
                  <button 
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="flex-1 bg-slate-500/5 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-500/10 transition-colors uppercase tracking-widest text-xs"
                  >
                    View Primary Info
                  </button>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="flex-1 bg-slate-500/5 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-500/10 transition-colors uppercase tracking-widest text-xs"
                  >
                    Edit Profile
                  </button>
                )}
                <button 
                  type="submit"
                  disabled={uploading.photo || uploading.doc}
                  className={cn(
                    "flex-1 font-black py-5 rounded-2xl transition-all shadow-xl uppercase tracking-widest text-xs",
                    (uploading.photo || uploading.doc) 
                      ? "bg-slate-700 text-slate-500 cursor-not-allowed" 
                      : "bg-primary text-slate-950 hover:opacity-90 shadow-primary"
                  )}
                >
                  {isViewOnly ? 'Close Vault' : mode === 'add' ? 'Confirm Registration' : 'Update Record'}
                </button>
              </div>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
