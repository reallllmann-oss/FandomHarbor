import type { Metadata } from "next";

import { pageMetadata } from "../../lib/seo";
import {
  BulletList,
  ContactLink,
  NumberedList,
  PolicyParagraph,
  PolicySection,
  PolicySubsection,
  PublicPolicyPage,
} from "../_components/public-policy";

export const metadata: Metadata = pageMetadata({
  description:
    "Fandom Harbor V1 的适用范围、账号与内容使用规则、服务边界及争议处理条款。",
  pathname: "/terms",
  title: "Terms of Use",
});

// Canonical source: docs/19_Release/V1-PUBLIC-POLICY-V1.0.md, sections 1, 3 and 5–9.
export default function TermsPage() {
  return (
    <PublicPolicyPage
      description="本页说明 Fandom Harbor V1 的适用范围、账号与内容使用规则、服务可用性、责任边界、适用法律及政策更新方式。"
      title="Terms of Use"
    >
      <PolicySection id="scope" title="1. 适用范围">
        <PolicyParagraph>Fandom Harbor，由刘祯莹个人运营。</PolicyParagraph>
        <BulletList>
          <li>运营主体：Fandom Harbor，由刘祯莹个人运营</li>
          <li>运营所在地：中华人民共和国</li>
          <li>
            联系邮箱：
            <ContactLink />
          </li>
        </BulletList>
        <PolicyParagraph>
          Fandom Harbor V1 是一个小范围、仅限受邀用户使用的文本作品平台。
        </PolicyParagraph>
        <BulletList>
          <li>
            用户必须年满 <strong className="text-foreground">18 周岁</strong>。
          </li>
          <li>V1 采用 invite-only 开放方式，仅限受邀用户注册和使用。</li>
          <li>V1 仅支持文本作品。</li>
          <li>
            Guest 可以访问
            Homepage、Archive、Search、公开作品发现信息和当前产品允许匿名查看的公开作者信息。
          </li>
          <li>
            Guest 不可以进入受 Membership 保护的 Work Detail，也不可以阅读
            Chapter 或 Article 正文。
          </li>
          <li>
            用户必须成功登录并拥有 active Reader Membership
            或更高有效授权，才能访问受保护的作品详情和正文。
          </li>
          <li>
            Reader 不自动拥有 Author 权限；访问 /studio 时会返回 /archive。
          </li>
        </BulletList>
      </PolicySection>

      <PolicySection id="rules" title="2. 使用条款">
        <PolicyParagraph>
          使用 Fandom Harbor V1 即表示用户同意遵守以下最低规则：
        </PolicyParagraph>
        <NumberedList>
          <li>用户必须年满 18 周岁，并通过受邀方式加入。</li>
          <li>用户不得共享账号、密码、认证信息或以他人身份使用服务。</li>
          <li>
            邀请资格、角色、有效账号及访问权限不得绕过平台的受控流程转让或变更。
          </li>
          <li>
            Guest
            只能使用公开发现页面；受保护的作品详情和正文需要登录及有效授权。
          </li>
          <li>
            V1
            仅用于文本作品。用户应确保其提交的内容拥有必要权利，且不侵犯他人合法权益。
          </li>
          <li>
            用户内容权利和为运行服务所需的授权，按照下方“用户内容许可”条款处理。
          </li>
          <li>
            用户不得干扰平台安全、规避访问控制、探测他人数据、传播恶意链接或以其他方式滥用服务。
          </li>
          <li>
            Fandom Harbor
            运营方可以为保护用户、内容和平台而暂停访问、限制发布、下架、归档或通过受控流程删除违规内容。
          </li>
        </NumberedList>

        <PolicySubsection title="2.1 用户内容许可">
          <PolicyParagraph>用户保留其依法拥有的内容权利。</PolicyParagraph>
          <PolicyParagraph>
            为运行 Fandom Harbor，用户授予 Fandom Harbor
            运营方一项非独占、仅限服务运行所需的许可，用于存储、备份、处理和向获准用户展示其提交的内容。
          </PolicyParagraph>
          <PolicyParagraph>
            该许可不允许 Fandom Harbor 运营方在与 Fandom Harbor
            服务无关的范围内出售或商业利用用户作品。
          </PolicyParagraph>
          <PolicyParagraph>
            当内容被取消公开、归档或依法删除后，Fandom Harbor
            运营方将停止继续公开展示；但安全、审计和备份副本可能按照本公开政策规定的期限继续保留。
          </PolicyParagraph>
        </PolicySubsection>

        <PolicySubsection title="2.2 账号暂停与终止">
          <PolicyParagraph>
            用户违反本公开政策、危害平台或其他用户安全、绕过访问控制、滥用邀请或权限，或不再满足邀请制准入条件时，Fandom
            Harbor 运营方可以暂停或终止其访问权限。
          </PolicyParagraph>
          <PolicyParagraph>
            暂停或终止访问不代表必须立即删除全部数据。相关数据仍按照隐私政策、审计、安全、备份和受控删除规则处理。
          </PolicyParagraph>
        </PolicySubsection>

        <PolicySubsection title="2.3 服务可用性">
          <PolicyParagraph>
            Fandom Harbor V1 以小范围、邀请制方式提供。
          </PolicyParagraph>
          <PolicyParagraph>
            服务可能因维护、安全事件、第三方基础设施故障、风险控制或不可控制的原因暂时中断或调整。
          </PolicyParagraph>
          <PolicyParagraph>
            Fandom Harbor
            运营方会在合理范围内维护服务，但不保证服务永久不中断、完全没有错误或始终满足所有用户需求。
          </PolicyParagraph>
        </PolicySubsection>
      </PolicySection>

      <PolicySection id="liability" title="3. 责任边界">
        <PolicyParagraph>
          用户应对其提交的内容、必要权利以及使用平台时的行为承担相应责任。
        </PolicyParagraph>
        <PolicyParagraph>
          在适用法律允许的范围内，Fandom Harbor
          运营方不对用户内容、第三方服务故障或无法合理控制的服务中断承担超出法律规定范围的责任。
        </PolicyParagraph>
        <PolicyParagraph>
          本条款不排除或限制依法不得排除或限制的责任。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="law" title="4. 适用法律与争议处理">
        <PolicyParagraph>
          本政策及 Fandom Harbor V1
          的运营、使用和相关争议，适用中华人民共和国法律。
        </PolicyParagraph>
        <PolicyParagraph>
          如用户与 Fandom Harbor 运营方发生争议，双方应先通过 <ContactLink />
          进行友好协商；协商无法解决时，提交中华人民共和国境内依法具有管辖权的人民法院处理。本政策不指定未经
          Product Owner 确认的具体城市、区县或法院。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="updates" title="5. 政策更新">
        <PolicyParagraph>
          本公开政策可能随产品功能、运营方式、服务提供商或适用要求变化而更新。
        </PolicyParagraph>
        <PolicyParagraph>
          重大变更应通过网站公告、登录或注册页面，或其他合理方式提示，并标明更新版本和生效日期。
        </PolicyParagraph>
        <PolicyParagraph>
          除安全、法律或紧急风险需要立即处理的情况外，重大政策更新应在合理时间内告知用户。
        </PolicyParagraph>
      </PolicySection>

      <PolicySection id="review-status" title="6. 法律审阅与发布状态">
        <PolicyParagraph>
          本政策的独立法律审阅状态为 NOT COMPLETED。Product Owner
          已接受在独立法律审阅尚未完成时先进行小范围、邀请制、Reader-only Beta
          的风险。
        </PolicyParagraph>
        <PolicyParagraph>
          该风险接受不允许公开注册、大规模商业运营、直接扩大外部 Author Beta
          或跳过后续法律审阅。政策尚未部署到
          Production，自正式网站发布之日起生效。
        </PolicyParagraph>
      </PolicySection>
    </PublicPolicyPage>
  );
}
