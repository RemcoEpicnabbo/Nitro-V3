import React from 'react';
import { GetSessionDataManager, RelationshipStatusInfoEvent, RelationshipStatusInfoMessageParser, UserRelationshipsComposer } from '@nitrots/nitro-renderer';
import { FC, FocusEvent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import { AvatarInfoUser, GetConfigurationValue, GetGroupInformation, GetUserProfile, LocalizeText, SendMessageComposer } from '../../../../../api';
import { Base, Column, Flex, LayoutAvatarImageView, LayoutBadgeImageView, Text, UserIdentityView, UserProfileIconView } from '../../../../../common';
import { useMessageEvent, useRoom } from '../../../../../hooks';
import { InfoStandBadgeSlotView } from './InfoStandBadgeSlotView';
import { InfoStandWidgetUserRelationshipsView } from './InfoStandWidgetUserRelationshipsView';
import { InfoStandWidgetUserTagsView } from './InfoStandWidgetUserTagsView';
import { BackgroundsView } from '../../../../backgrounds/BackgroundsView';

interface InfoStandWidgetUserViewProps {
  avatarInfo: AvatarInfoUser;
  onClose: () => void;
}

export const InfoStandWidgetUserView: FC<InfoStandWidgetUserViewProps> = props =>
{
    const { avatarInfo = null, onClose = null } = props;
    const [motto, setMotto] = useState<string>(null);
    const [isEditingMotto, setIsEditingMotto] = useState(false);
    const [relationships, setRelationships] = useState<RelationshipStatusInfoMessageParser>(null);
    const [backgroundId, setBackgroundId] = useState<number>(null);
    const [standId, setStandId] = useState<number>(null);
    const [overlayId, setOverlayId] = useState<number>(null);
    const [cardBackgroundId, setCardBackgroundId] = useState<number>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { roomSession = null } = useRoom();

    const infostandBackgroundClass = `background-${backgroundId ?? 'default'}`;
    const infostandStandClass = `stand-${standId ?? 'default'}`;
    const infostandOverlayClass = `overlay-${overlayId ?? 'default'}`;
    const infostandCardBackgroundClass = cardBackgroundId ? `card-background-${cardBackgroundId}` : '';
    const handleProfileClick = useCallback(() =>
    {
        GetUserProfile(avatarInfo.webID);
    }, [avatarInfo.webID]);

    const handleEditClick = useCallback((event: React.MouseEvent) =>
    {
        event.stopPropagation(); setIsVisible(prev => !prev);
    }, []);

    const saveMotto = (motto: string) =>
    {
        if (!isEditingMotto || motto.length > GetConfigurationValue<number>('motto.max.length', 38) || !roomSession) return;

        roomSession.sendMottoMessage(motto);
        setIsEditingMotto(false);
    };

    const onMottoBlur = (event: FocusEvent<HTMLInputElement>) => saveMotto(event.target.value);

    const onMottoKeyDown = (event: KeyboardEvent<HTMLInputElement>) =>
    {
        event.stopPropagation();

        switch (event.key)
        {
            case 'Enter':
                saveMotto((event.target as HTMLInputElement).value);
                return;
        }
    };

    useMessageEvent<RelationshipStatusInfoEvent>(RelationshipStatusInfoEvent, event =>
    {
        const parser = event.getParser();

        if (!avatarInfo || avatarInfo.webID !== parser.userId) return;

        setRelationships(parser);
    });

    useEffect(() =>
    {
        setIsEditingMotto(false);
        setMotto(avatarInfo.motto);
        setBackgroundId(avatarInfo.backgroundId);
        setStandId(avatarInfo.standId);
        setOverlayId(avatarInfo.overlayId);
        setCardBackgroundId(avatarInfo.cardBackgroundId ?? 0);

        SendMessageComposer(new UserRelationshipsComposer(avatarInfo.webID));

        return () =>
        {
            setRelationships(null);
        };
    }, [avatarInfo]);

    if (!avatarInfo) return null;

    return (
        <>
            <Column className={`relative min-w-[190px] max-w-[190px] z-30 pointer-events-auto ${cardBackgroundId ? '' : 'bg-[rgba(28,28,32,0.95)]'} [box-shadow:inset_0_5px_#22222799,inset_0_-4px_#12121599] rounded overflow-hidden profile-card-background ${infostandCardBackgroundClass}`}>
                <Column className="h-full p-[8px] overflow-auto" gap={1} overflow="visible">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <UserProfileIconView userId={avatarInfo.webID} />
                                <UserIdentityView
                                    className="text-[12px]"
                                    displayOrder={ avatarInfo.displayOrder }
                                    nameClassName="text-white"
                                    nickIcon={ avatarInfo.nickIcon }
                                    prefixColor={ avatarInfo.prefixColor }
                                    prefixEffect={ avatarInfo.prefixEffect }
                                    prefixFont={ avatarInfo.prefixFont }
                                    prefixIcon={ avatarInfo.prefixIcon }
                                    prefixText={ avatarInfo.prefixText }
                                    username={ avatarInfo.name } />
                            </div>
                            <FaTimes className="cursor-pointer fa-icon" onClick={onClose} />
                        </div>
                        <hr className="m-0 bg-[#0003] border-0 opacity-[0.5] h-px" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex gap-1">
                            <Column
                                fullWidth
                                className={`flex items-center w-full max-w-[68px] rounded-sm relative overflow-hidden profile-background ${infostandBackgroundClass}`}
                                onClick={handleProfileClick}
                            >
                                <Base position="absolute" className={`profile-stand ${infostandStandClass}`} />
                                <LayoutAvatarImageView direction={2} figure={avatarInfo.figure} />
                                <Base position="absolute" className={`profile-overlay ${infostandOverlayClass}`} />
                            </Column>
                            {avatarInfo.type === AvatarInfoUser.OWN_USER && (
                                <Base
                                    className="background-edit-icon background-edit-position"
                                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                    onClick={handleEditClick}
                                    aria-label="Edit profile background"
                                />
                            )}
                            <Column grow alignItems="center" gap={0}>
                                { (() =>
                                {
                                    const maxSlots = GetConfigurationValue<number>('user.badges.max.slots', 5);
                                    const isOwnUser = avatarInfo.type === AvatarInfoUser.OWN_USER;
                                    const showGroup = maxSlots <= 5;

                                    const items: React.ReactNode[] = [];
                                    items.push(<InfoStandBadgeSlotView key={0} slotIndex={0} badgeCode={avatarInfo.badges[0]} isOwnUser={isOwnUser} />);

                                    if(showGroup)
                                    {
                                        items.push(
                                            <Flex key="group" center className="relative w-[40px] h-[40px] bg-no-repeat bg-center" pointer={avatarInfo.groupId > 0} onClick={event => GetGroupInformation(avatarInfo.groupId)}>
                                                {avatarInfo.groupId > 0 && <LayoutBadgeImageView badgeCode={avatarInfo.groupBadgeId} customTitle={avatarInfo.groupName} isGroup={true} showInfo={true} />}
                                            </Flex>
                                        );
                                    }
                                    else
                                    {
                                        items.push(<InfoStandBadgeSlotView key="slot1" slotIndex={1} badgeCode={avatarInfo.badges[1]} isOwnUser={isOwnUser} />);
                                    }

                                    const startIdx = showGroup ? 1 : 2;
                                    for(let i = startIdx; i < maxSlots; i++)
                                    {
                                        items.push(<InfoStandBadgeSlotView key={i} slotIndex={i} badgeCode={avatarInfo.badges[i]} isOwnUser={isOwnUser} />);
                                    }

                                    const rows: React.ReactNode[][] = [];
                                    for(let i = 0; i < items.length; i += 2)
                                    {
                                        rows.push(items.slice(i, i + 2));
                                    }

                                    return rows.map((row, idx) => (
                                        <Flex key={idx} center gap={1}>{row}</Flex>
                                    ));
                                })() }
                            </Column>
                        </div>
                        <hr className="m-0 bg-[#0003] border-0 opacity-[0.5] h-px" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Flex alignItems="center" className="bg-light-dark rounded py-1 px-2">
                            {avatarInfo.type !== AvatarInfoUser.OWN_USER && (
                                <Flex grow alignItems="center" className="min-h-[18px]">
                                    <Text fullWidth pointer small textBreak wrap variant="white">{motto}</Text>
                                </Flex>
                            )}
                            {avatarInfo.type === AvatarInfoUser.OWN_USER && (
                                <Flex grow alignItems="center" gap={2}>
                                    <FaPencilAlt className="small fa-icon" />
                                    <Flex grow alignItems="center" className="min-h-[18px]">
                                        {!isEditingMotto && (
                                            <Text fullWidth pointer small textBreak wrap variant="white" onClick={event => setIsEditingMotto(true)}>
                                                {motto}
                                            </Text>
                                        )}
                                        {isEditingMotto && (
                                            <input
                                                autoFocus={true}
                                                className="w-full h-full text-[12px] p-0 outline-0 border-0 text-[#fff] relative bg-transparent resize-none focus:italic border-transparent focus:border-transparent focus:ring-0"
                                                maxLength={GetConfigurationValue<number>('motto.max.length', 38)}
                                                type="text"
                                                value={motto}
                                                onBlur={onMottoBlur}
                                                onChange={event => setMotto(event.target.value)}
                                                onKeyDown={onMottoKeyDown}
                                            />
                                        )}
                                    </Flex>
                                </Flex>
                            )}
                        </Flex>
                        <hr className="m-0 bg-[#0003] border-0 opacity-[0.5] h-px" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Text small wrap variant="white">
                            {LocalizeText('infostand.text.achievement_score') + ' ' + avatarInfo.achievementScore}
                        </Text>
                        {avatarInfo.carryItem > 0 && (
                            <>
                                <hr className="m-0 bg-[#0003] border-0 opacity-[0.5] h-px" />
                                <Text small wrap variant="white">
                                    {LocalizeText('infostand.text.handitem', ['item'], [LocalizeText('handitem' + avatarInfo.carryItem)])}
                                </Text>
                            </>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <InfoStandWidgetUserRelationshipsView relationships={relationships} />
                    </div>
                    {GetConfigurationValue('user.tags.enabled') && (
                        <Column className="mt-1" gap={1}>
                            <InfoStandWidgetUserTagsView tags={GetSessionDataManager().tags} />
                        </Column>
                    )}
                </Column>
            </Column>
            {isVisible && avatarInfo.type === AvatarInfoUser.OWN_USER && (
                <div className="backgrounds-view-container">
                    <BackgroundsView
                        setIsVisible={setIsVisible}
                        selectedBackground={backgroundId}
                        setSelectedBackground={setBackgroundId}
                        selectedStand={standId}
                        setSelectedStand={setStandId}
                        selectedOverlay={overlayId}
                        setSelectedOverlay={setOverlayId}
                        selectedCardBackground={cardBackgroundId}
                        setSelectedCardBackground={setCardBackgroundId}
                    />
                </div>
            )}
        </>
    );
};
