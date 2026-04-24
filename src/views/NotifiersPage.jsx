import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { LoginContext } from "@/context/Contexts";
import { RequestUtils } from "@/lib/RequestUtils";
import NotifierCard from "@/components/NotifierCard";
import EmptyCards from "@/components/EmptyCards";
import ScrollHintContainer from "@/components/ScrollHintContainer";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";

const NotifiersPage = () => {
  const TOTAL_NOTIFIERS_NO = NotifierCatalog.getSupportedNotifiers().size;
  const [notifiers, setNotifiers] = useState([]);
  const [addDisabled, setAddDisabled] = useState(false);
  const { userId, token } = useContext(LoginContext);

  const getValidUserId = useCallback(() => {
    const user = Number.parseInt(String(userId()), 10);
    if (!Number.isInteger(user) || user <= 0) {
      return null;
    }
    return user;
  }, [userId]);

  const getAuthHeaders = useCallback(() => ({
    Authorization: `Bearer ${token}`,
  }), [token]);

  const refreshNotifiers = useCallback(async () => {
    try {
      const user = getValidUserId();
      if (user == null) {
        toast.error(`Missing user ID, please re-login and try again.`);
        return;
      }
      if (!token) {
        toast.error(`Missing user token, please re-login and try again.`);
        return;
      }
      const notifiersUrl = RequestUtils.buildUrl("/api/notifier", { user });
      const notifiersResponse = await fetch(notifiersUrl, { headers: getAuthHeaders() });
      if (!notifiersResponse.ok) {
        toast.error(await RequestUtils.getResponseMessage(notifiersResponse));
        return;
      }
      const notifiersData = await notifiersResponse.json();
      setNotifiers(notifiersData);
      setAddDisabled(notifiersData.length === TOTAL_NOTIFIERS_NO);
    } catch (error) {
      toast.error(`Failed to get notifier data: ${error.message}`);
    }
  }, [TOTAL_NOTIFIERS_NO, getAuthHeaders, getValidUserId, token]);

  useEffect(() => {
    refreshNotifiers();
  }, [refreshNotifiers]);

  const removeNotifier = (id) => {
    setNotifiers((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      setAddDisabled(updated.length === TOTAL_NOTIFIERS_NO);
      return updated;
    });
  };

  const getOptions = () => {
    const available = NotifierCatalog.getSupportedNotifiers().keys();
    const used = notifiers.map((notifier) => notifier.type);
    return available.map((option) => ({ text: option, value: option, isDisabled: used.includes(option) }));
  };

  const getCards = () => {
    if (notifiers.length === 0) {
      return <EmptyCards whatToAdd={"notifier"} showFooter={false} />;
    }
    return notifiers.map((notifier, index) => {
      return (
        <NotifierCard
          key={`${index}${notifier.id}_${notifier.type}`}
          data={{ ...notifier, user: getValidUserId(), token }}
          options={getOptions()}
          onChange={refreshNotifiers}
          onDelete={removeNotifier}
        />
      );
    });
  };

  const addNotifier = () => {
    setAddDisabled(true);
    setNotifiers((currentNotifiers) => [
      ...currentNotifiers,
      {
        type: "",
        origin: "",
        sender: "",
        password: "",
        user: getValidUserId(),
        token,
      },
    ]);
  };

  return (
    <section id="notifiers-section">
      <ScrollHintContainer
        as="div"
        className={`notifier-cards-div${notifiers.length !== 0 ? " is-empty" : ""}`}
        hintText="More notifiers below, scroll down"
        hideScrollbar={true}
      >
        {getCards()}
      </ScrollHintContainer>
      <button className="add-notifier" onClick={addNotifier} disabled={addDisabled}>
        add
      </button>
    </section>
  );
};

export default NotifiersPage;
