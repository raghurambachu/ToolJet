import React, { useState, useEffect, useRef } from 'react';
import { default as BootstrapModal } from 'react-bootstrap/Modal';
import moment from 'moment';
import { appService } from '../_services/app.service';
import { toast } from 'react-hot-toast';
import { useMounted } from '@/_hooks/use-mount';

export default function ExportAppModal({ title, show, closeModal, customClassName, app, darkMode }) {
  const mounted = useMounted();
  const [versions, getVersions] = useState(undefined);
  const [versionId, setVersionId] = useState(undefined);
  const currentVersion = app.editing_version;

  useEffect(() => {
    async function fetchAppVersions() {
      try {
        const fetchVersions = await appService.getVersions(app.id);
        const { versions } = await fetchVersions;
        getVersions(versions);
      } catch (error) {
        toast.error('Could not fetch the versions.', {
          position: 'top-center',
        });
        closeModal();
      }
    }
    fetchAppVersions();
  }, []);

  useEffect(() => {
    if (mounted && versions.length >= 1) {
      setVersionId(currentVersion.id);
    }
  }, [versions]);

  const exportApp = (appId, versionId = undefined) => {
    appService
      .exportApp(appId, versionId)
      .then((data) => {
        const appName = app.name.replace(/\s+/g, '-').toLowerCase();
        const fileName = `${appName}-export-${new Date().getTime()}`;
        // simulate link click download
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + '.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        closeModal();
      })
      .catch((error) => {
        toast.error('Could not export the app.', {
          position: 'top-center',
        });
        closeModal();
      });
  };

  return (
    <BootstrapModal
      onHide={() => closeModal(false)}
      contentClassName={`home-modal-component ${customClassName ? ` ${customClassName}` : ''} ${darkMode && 'dark'}`}
      show={show}
      size="md"
      backdrop={true}
      keyboard={true}
      enforceFocus={false}
      animation={false}
      onEscapeKeyDown={() => closeModal()}
      centered
      data-cy={'modal-component'}
    >
      <BootstrapModal.Header className="border-bottom">
        <BootstrapModal.Title data-cy={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}>
          {title}
        </BootstrapModal.Title>
        <button
          className="btn-close"
          aria-label="Close"
          onClick={() => closeModal()}
          data-cy="modal-close-button"
        ></button>
      </BootstrapModal.Header>
      {Array.isArray(versions) ? (
        <>
          <BootstrapModal.Body>
            <div className="py-2">
              <div className="current-version py-2">
                <span className="text-muted">Current Version</span>
                <InputRadioField
                  versionId={currentVersion.id}
                  versionName={currentVersion.name}
                  versionCreatedAt={currentVersion.createdAt}
                  checked={versionId === currentVersion.id}
                  setVersionId={setVersionId}
                />
              </div>
              {versions.length >= 2 ? (
                <div className="other-versions py-2">
                  <span className="text-muted">Other Versions</span>
                  {versions.map((version, index) => {
                    if (version.id !== currentVersion.id) {
                      return (
                        <InputRadioField
                          versionId={version.id}
                          versionName={version.name}
                          versionCreatedAt={version.createdAt}
                          key={version.name}
                          checked={versionId === version.id}
                          setVersionId={setVersionId}
                        />
                      );
                    }
                  })}
                </div>
              ) : (
                <div className="other-versions py-2">
                  <span className="text-muted">No other versions found</span>
                </div>
              )}
            </div>
          </BootstrapModal.Body>
          <BootstrapModal.Footer className="export-app-modal-footer d-flex justify-content-end border-top align-items-center py-2">
            <span role="button" className="btn btn-light" onClick={() => exportApp(app.id)}>
              Export All
            </span>
            <span role="button" className="btn btn-primary" onClick={() => exportApp(app.id, versionId)}>
              Export selected version
            </span>
          </BootstrapModal.Footer>
        </>
      ) : (
        <Loader />
      )}
    </BootstrapModal>
  );
}

function InputRadioField({
  versionId,
  versionName,
  versionCreatedAt,
  checked = undefined,
  key = undefined,
  setVersionId,
}) {
  return (
    <span key={key} className="version-wrapper my-2 py-2 cursor-pointer">
      <input
        type="radio"
        value={versionId}
        id={`${versionName}`}
        name="version"
        checked={checked}
        onClick={({ target }) => setVersionId(target.value)}
        style={{ marginLeft: '1rem' }}
        className="cursor-pointer"
      />
      <label
        htmlFor={`${versionName}`}
        className="d-flex flex-column cursor-pointer w-100"
        style={{ paddingLeft: '0.75rem' }}
      >
        <span>{versionName}</span>
        <span className="text-secondary">{`Created at ${moment(versionCreatedAt).format('Do MMM YYYY')}`}</span>
      </label>
    </span>
  );
}

function Loader() {
  return (
    <BootstrapModal.Body>
      <div className="d-flex justify-content-center align-items-center flex-column" style={{ minHeight: '30vh' }}>
        <div className="pb-2">Loading versions ...</div>
        <div className="spinner-border" role="status"></div>
      </div>
    </BootstrapModal.Body>
  );
}
