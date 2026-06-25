-- invited_email was NOT NULL, but an invite link should be generatable even
-- when the member was added without an email address.
alter table family_invites
  alter column invited_email drop not null;
