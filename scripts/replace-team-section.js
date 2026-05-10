const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'views', 'account', 'account-team.ejs');
let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Replace lines 124-247 (0-indexed: 123-246) with new member rows
const before = lines.slice(0, 123); // lines 1-123
const after = lines.slice(246);      // lines 248+

const newSection = `        <!-- Member Rows -->
        <div>
          <template x-for="member in filteredMembers" :key="member._id">
            <div class="ts-member-row" x-data="{open:false,editRole:false}" @click.outside="open=false;editRole=false">
              <div style="position:relative;flex-shrink:0;">
                <template x-if="member.avatar"><img :src="member.avatar" :alt="member.name" /></template>
                <template x-if="!member.avatar">
                  <div :style="'width:36px;min-width:36px;max-width:36px;height:36px;min-height:36px;max-height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;background:' + avatarColor(member.name)">
                    <span x-text="member.name.charAt(0).toUpperCase()"></span>
                  </div>
                </template>
                <span class="ts-status" :class="member.userStatus === 'active' ? 'ts-status-online' : 'ts-status-offline'" style="position:absolute;bottom:0;right:-2px;"></span>
              </div>
              <div class="ts-member-row-info" style="min-width:120px;">
                <div class="ts-member-row-name" x-text="member.name"></div>
                <div class="ts-member-row-email" x-text="member.email"></div>
              </div>
              <span class="ts-role-badge" :class="'ts-role-' + member.role" x-text="roleLabel(member.role)"></span>
              <!-- Team Badges -->
              <div style="display:flex;gap:4px;flex-wrap:wrap;min-width:0;">
                <template x-for="team in getMemberTeams(member._id)" :key="'tb-'+team._id">
                  <span class="ts-team-badge" :style="'background:' + team.color + '10;color:' + team.color">
                    <div :style="'width:6px;height:6px;border-radius:50%;background:' + team.color + ';flex-shrink:0;'"></div>
                    <span x-text="team.name"></span>
                  </span>
                </template>
              </div>
              <!-- Permission Status -->
              <template x-if="member.entityPermissions && member.entityPermissions.length > 0">
                <span style="font-size:10px;font-weight:600;padding:3px 8px;border-radius:6px;background:rgba(249,115,22,.08);color:#f97316;white-space:nowrap;" x-text="member.entityPermissions.length + ' entité(s)'"></span>
              </template>
              <template x-if="(!member.entityPermissions || member.entityPermissions.length === 0) && (!member.entityAccess || member.entityAccess.length === 0)">
                <span style="font-size:10px;font-weight:600;padding:3px 8px;border-radius:6px;background:rgba(34,197,94,.08);color:#22c55e;white-space:nowrap;">Accès complet</span>
              </template>
              <!-- Actions -->
              <div style="display:flex;align-items:center;gap:6px;margin-left:auto;flex-shrink:0;">
                <a :href="'/account/<%= account_number %>/permissions?user=' + member._id" style="padding:4px 10px;border:1px solid #e0e6ed;background:#fff;border-radius:8px;font-size:11px;font-weight:600;color:#64748b;cursor:pointer;display:flex;align-items:center;gap:4px;font-family:inherit;white-space:nowrap;transition:all .15s;text-decoration:none;" onmouseover="this.style.borderColor='#4361ee';this.style.color='#4361ee'" onmouseout="this.style.borderColor='#e0e6ed';this.style.color='#64748b'" x-show="member.role !== 'owner'">
                  <iconify-icon icon="solar:lock-keyhole-bold" width="12"></iconify-icon> Accès
                </a>
                <div style="position:relative;" x-show="member.role !== 'owner'">
                  <button @click="open=!open" style="width:28px;height:28px;border-radius:8px;border:none;background:transparent;color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;" onmouseover="this.style.background='#f1f5f9';this.style.color='#0e1726'" onmouseout="this.style.background='transparent';this.style.color='#94a3b8'">
                    <iconify-icon icon="solar:menu-dots-bold" width="16"></iconify-icon>
                  </button>
                  <div x-show="open" x-transition style="position:absolute;right:0;top:32px;background:#fff;border:1px solid #e0e6ed;border-radius:12px;padding:6px;min-width:200px;box-shadow:0 8px 24px rgba(0,0,0,.1);z-index:10;" class="dark:!bg-[#0e1726] dark:!border-[#253b5c]">
                    <template x-if="!editRole">
                      <div>
                        <button @click="editRole=true" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;width:100%;border:none;background:none;font-size:12px;font-weight:500;color:#334155;cursor:pointer;font-family:inherit;" class="dark:!text-[#cbd5e1]" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'">
                          <iconify-icon icon="solar:pen-bold" width="14"></iconify-icon> Modifier le rôle
                        </button>
                        <button @click="removeMember(member._id, member.name); open=false" style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:8px;width:100%;border:none;background:none;font-size:12px;font-weight:500;color:#ef4444;cursor:pointer;font-family:inherit;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">
                          <iconify-icon icon="solar:trash-bin-trash-bold" width="14"></iconify-icon> Révoquer l'accès
                        </button>
                      </div>
                    </template>
                    <template x-if="editRole">
                      <div>
                        <div style="padding:6px 12px 4px;font-size:10px;font-weight:700;text-transform:uppercase;color:#94a3b8;">Choisir un rôle</div>
                        <template x-for="r in ['admin','manager','member','viewer']" :key="r">
                          <button @click="updateRole(member._id, r); open=false; editRole=false" style="display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:8px;width:100%;border:none;background:none;font-size:12px;font-weight:500;color:#334155;cursor:pointer;font-family:inherit;" class="dark:!text-[#cbd5e1]" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='none'">
                            <span class="ts-role-badge" :class="'ts-role-' + r" x-text="roleLabel(r)" style="font-size:9px;"></span>
                            <iconify-icon x-show="member.role === r" icon="solar:check-circle-bold" width="14" style="color:#22c55e;margin-left:auto;"></iconify-icon>
                          </button>
                        </template>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <template x-if="filteredMembers.length === 0">
            <div style="padding:40px 20px;text-align:center;color:#94a3b8;">
              <iconify-icon icon="solar:users-group-rounded-bold-duotone" width="32" style="opacity:.5;"></iconify-icon>
              <p style="margin-top:8px;font-size:13px;">Aucun membre ne correspond aux filtres</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Pending Invites -->
      <template x-if="invitations.length > 0">
        <div style="margin-top:24px;">
          <div class="ts-separator">
            <div class="ts-separator-line"></div>
            <div class="ts-separator-label">
              <iconify-icon icon="solar:letter-bold-duotone" width="14" style="color:#f97316"></iconify-icon>
              Invitations en attente
            </div>
            <div class="ts-separator-line"></div>
          </div>
          <div class="ts-members-section">
            <template x-for="inv in invitations" :key="inv.email">
              <div class="ts-member-row" style="opacity:.75;">
                <div style="width:36px;height:36px;border-radius:50%;background:rgba(249,115,22,.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <iconify-icon icon="solar:letter-bold" width="16" style="color:#f97316"></iconify-icon>
                </div>
                <div class="ts-member-row-info">
                  <div class="ts-member-row-name" x-text="inv.email"></div>
                  <div class="ts-member-row-email" x-text="'Invitation envoyée ' + formatDate(inv.invitedAt)"></div>
                </div>
                <span class="ts-role-badge" :class="'ts-role-' + inv.role" x-text="roleLabel(inv.role)"></span>
                <div style="margin-left:auto;display:flex;gap:6px;align-items:center;">
                  <button class="ts-filter-btn" style="font-size:11px;padding:5px 10px;" @click="resendInvite(inv.email)">Renvoyer</button>
                  <button style="padding:6px;border:none;background:none;color:#ef4444;cursor:pointer;border-radius:6px;" @click="cancelInvite(inv.email)">
                    <iconify-icon icon="solar:close-circle-bold" width="18"></iconify-icon>
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>`;

const result = [...before, newSection, ...after].join('\n');
fs.writeFileSync(filePath, result, 'utf8');
console.log('Done! Replaced lines 124-247 with new member rows section.');
console.log('New total lines:', result.split('\n').length);
